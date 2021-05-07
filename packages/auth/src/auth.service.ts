import { Injectable, Inject, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { AUTH_OPTIONS, LOGIN_ERRORS, SIGNUP_ERRORS } from './constants';
import { LoginDto, SignupDto, User } from './dto';
import { AuthOptions, IJwtPayload, ILoginResponse, IThirdPartyUser, ITokens, IUsersService } from './interfaces';
import * as crypto from 'crypto';
import { Request } from 'express';
import { TokenService } from './token';
import { UserIdentityService } from './user-identity';

@Injectable()
export class AuthService {
  private readonly usersService: IUsersService;
  constructor(
    private readonly tokenService: TokenService,
    private readonly userIdentityService: UserIdentityService,

    @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions,
  ) {
    this.usersService = this._AuthOptions.usersService;
  }

  async signup(data: SignupDto): Promise<User> {
    const { email, password } = data;
    const userExist = await this.usersService.findByEmail(email);
    if (userExist) {
      throw new BadRequestException(SIGNUP_ERRORS.USER_ALREADY_EXISTS);
    }
    const user = await this.usersService.create({ email: email, password: password });
    return user;
  }

  async login(data: LoginDto): Promise<ILoginResponse> {
    const { email, password } = data;
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new NotFoundException(LOGIN_ERRORS.WRONG_CREDENTIALS);
    }
    if (this._AuthOptions.constants.blockNotVerifiedUser && !user.isVerified) {
      throw new UnauthorizedException(LOGIN_ERRORS.USER_NOT_VERIFIED);
    }
    const { accessToken, refreshToken } = await this.createTokensForUser(user._id, user.roles);
    return this.createLoginResponse(accessToken, refreshToken.value);
  }

  async logout(userId: string): Promise<void> {
    await this.tokenService.deleteRefreshTokenForUser(userId);
  }

  async refresh(token: string): Promise<ILoginResponse> {
    const refreshToken = await this.tokenService.refresh(token);
    const user = await this.usersService.findById(refreshToken.userId);
    const payload: IJwtPayload = {
      sub: {
        id: user.id,
        roles: user.roles,
      },
    };
    const accessToken = await this.tokenService.createAccessToken(payload);
    return this.createLoginResponse(accessToken, refreshToken.value);
  }

  async thirdPartyLogin(userId: string, roles: string[]): Promise<ILoginResponse> {
    const { accessToken, refreshToken } = await this.createTokensForUser(userId, roles);
    return this.createLoginResponse(accessToken, refreshToken.value);
  }

  private createLoginResponse(accessToken: string, refreshToken: string): ILoginResponse {
    const loginResponse: ILoginResponse = {
      accessToken: accessToken,
      expiresIn: this._AuthOptions.jwtModuleConfig.signOptions.expiresIn,
      tokenType: 'Bearer',
      refreshToken: refreshToken,
    };
    return loginResponse;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      //if user exists then validate it
      const valid = await this.usersService.validateUser(email, password);
      if (!valid) {
        throw new UnauthorizedException(LOGIN_ERRORS.WRONG_CREDENTIALS);
      }
    } else {
      //else user not exists. check if there is an identity with the same email
      const identity = await this.userIdentityService.findOne({ email: email });
      //if exists then throw a warning to the user
      if (identity) {
        throw new UnauthorizedException(LOGIN_ERRORS.IDENTITY_LINKED);
      }
      //else no user exists
      throw new NotFoundException(LOGIN_ERRORS.USER_NOT_FOUND);
    }
    //if user exists and is valid
    return user;
  }

  async validateThirdPartyIdentity(thirdPartyUser: IThirdPartyUser): Promise<User> {
    //search userIdentity and if found log the owner
    const userIdentity = await this.userIdentityService.findOne({
      externalId: thirdPartyUser.externalId,
      provider: thirdPartyUser.provider,
    });
    if (userIdentity) {
      const user = await this.usersService.findById(userIdentity.userId);
      return user;
    }

    //if not found, then search a user with ther thirdPartyUser.email
    const user = await this.usersService.findByEmail(thirdPartyUser.email);
    //if exists then throw a warning to the user
    if (user) {
      throw new UnauthorizedException(LOGIN_ERRORS.USER_NOT_LINKED);
    }

    //if not found, create new user + new userIdentity
    const randomPassword = crypto.randomBytes(64).toString('hex');
    const registeredUser = await this.usersService.create({
      email: thirdPartyUser.email,
      isVerified: true,
      password: randomPassword,
    });
    await this.userIdentityService.linkIdentity(thirdPartyUser, registeredUser._id);
    return registeredUser;
  }

  tokenFromRequestExtractor(req: Request) {
    return this._AuthOptions.constants.jwt.tokenFromRequestExtractor(req);
  }

  private async createTokensForUser(userId: string, roles: string[]): Promise<ITokens> {
    const payload: IJwtPayload = {
      sub: {
        id: userId,
        roles: roles,
      },
    };
    const accessToken = await this.tokenService.createAccessToken(payload);
    const refreshToken = await this.tokenService.createRefreshToken(userId);

    return { accessToken, refreshToken };
  }
}

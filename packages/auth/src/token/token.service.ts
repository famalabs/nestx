import {
  Injectable,
  Inject,
  CACHE_MANAGER,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ReturnModelType } from '@typegoose/typegoose';
import { RefreshToken } from '../models/refresh-token.model';
import { JwtService } from '@nestjs/jwt';
import { AUTH_OPTIONS, JWT_ERRORS, REFRESH_TOKEN_ERRORS } from '../constants';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { IAccessToken, ILoginResponse } from './../interfaces/login-response.interface';
import { BaseService } from '../shared/base-service';
import { InjectModel } from '@nestjs/mongoose';
import { IAuthenticationModuleOptions, IRefreshToken } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService extends BaseService<RefreshToken> {
  private refreshTokenTtl: number;
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly _tokenModel: ReturnModelType<typeof RefreshToken>,
    private jwtService: JwtService,
    @Inject(AUTH_OPTIONS) private options: IAuthenticationModuleOptions,
    @Inject(CACHE_MANAGER) protected readonly cacheManager,
  ) {
    super(_tokenModel);
    this.refreshTokenTtl = options.constants.jwt.refreshTokenTTL;
  }

  async getAccessTokenFromRefreshToken(
    refreshToken: string,
    oldAccessToken: string,
    clientId: string,
    ipAddress: string,
  ): Promise<ILoginResponse> {
    // check if refresh token exist in database and is still valid
    const token = await this.findOne({ value: refreshToken });
    if (!token) {
      throw new NotFoundException(REFRESH_TOKEN_ERRORS.TOKEN_NOT_FOUND);
    }
    const currentDate = new Date();
    if (token.expiresAt < currentDate) {
      throw new BadRequestException(REFRESH_TOKEN_ERRORS.TOKEN_EXPIRED);
    }

    // Now Generate a new access token
    // check if oldAccessToken was blacklisted
    const isBlacklisted = await this.isBlackListed(oldAccessToken);
    if (isBlacklisted) {
      throw new UnauthorizedException(JWT_ERRORS.TOKEN_BLACKLISTED);
    }
    // Check if the oldAccesToken was a validToken (ignore expiration this time)
    const oldPayload: IJwtPayload = await this.validateToken(oldAccessToken, true);
    const payload: IJwtPayload = {
      sub: oldPayload.sub,
    };

    // check if the owner of the oldAccessToken is the same of the refreshToken
    if (!(token.userId === payload.sub)) {
      throw new UnauthorizedException(JWT_ERRORS.WRONG_OWNER);
    }

    // create a newAccessToken with oldPayload and revoke the oldOne
    const loginResponse: ILoginResponse = await this.createAccessToken(payload);
    await this.revokeToken(oldAccessToken, oldPayload.sub);

    // Remove old refresh token and generate a new one
    await this.delete(token._id);
    const refreshTMP = await this.createRefreshToken({
      userId: oldPayload.sub,
      clientId,
      ipAddress,
    });
    loginResponse.refreshToken = refreshTMP.value;

    return loginResponse;
  }

  async createAccessToken(payload: IJwtPayload): Promise<IAccessToken> {
    const opts = this.options.modules.jwt.signOptions;
    //this optional setting avoid any collision in token generation
    opts.jwtid = uuidv4();
    const accessToken = this.jwtService.sign(payload, opts);
    const token: ILoginResponse = {
      accessToken: accessToken,
      expiresIn: this.options.modules.jwt.signOptions.expiresIn,
      tokenType: 'Bearer',
    };
    return token;
  }

  async createRefreshToken(tokenContent: {
    userId: string;
    clientId: string;
    ipAddress: string;
  }): Promise<IRefreshToken> {
    const { userId, clientId, ipAddress } = tokenContent;

    const refreshToken = new RefreshToken();
    refreshToken.userId = userId;
    refreshToken.value = randomBytes(64).toString('hex');
    refreshToken.clientId = clientId;
    refreshToken.ipAddress = ipAddress;
    const date = new Date();
    refreshToken.expiresAt = new Date(date.setDate(date.getDate() + this.refreshTokenTtl));
    await this.create(refreshToken);

    return refreshToken;
  }

  async deleteAllRefreshTokenForUser(userId: string) {
    await this.model.deleteMany({ userId: { $eq: userId } }).exec();
  }

  async deleteRefreshToken(value: string) {
    console.log(value);
    const doc = await this.findOne({ value: value });
    console.log(doc);
    await this.delete({ value: value });
  }

  private async validateToken(token: string, ignoreExpiration: boolean = false): Promise<IJwtPayload> {
    try {
      return this.jwtService.verify(token, {
        ignoreExpiration,
      }) as IJwtPayload;
    } catch (err) {
      throw new UnauthorizedException(JWT_ERRORS.TOKEN_NOT_VALID);
    }
  }

  async isBlackListed(accessToken: string): Promise<boolean> {
    const value = await this.cacheManager.get(accessToken);
    //if value is null => token isn't blacklisted
    //if values isn't null => token is blacklisted
    if (!value) {
      return false;
    }
    return true;
  }

  async revokeToken(accessToken: string, userId: string) {
    await this.cacheManager.set(accessToken, userId);
    return;
  }
}

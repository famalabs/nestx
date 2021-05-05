import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { AUTH_OPTIONS, EMAIL_ERRORS, LOGIN_ERRORS, RESET_PASSWORD_ERRORS, SIGNUP_ERRORS } from './constants';
import { LoginDto, ResetPasswordDto, SignupDto, User } from './dto';
import {
  AuthOptions,
  IEmailNotification,
  IJwtPayload,
  ILoginResponse,
  INotificationSender,
  IThirdPartyUser,
  ITokens,
  IUsersService,
  NOTIFICATION_CATEGORY,
} from './interfaces';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { Request } from 'express';
import { TokenService } from './token';
import { EmailNotificationService, IEmailOptions } from './notification';
import { UserIdentityService } from './user-identity';

@Injectable()
export class AuthService {
  private readonly usersService: IUsersService;
  private readonly notificationSender: INotificationSender;
  constructor(
    private readonly tokenService: TokenService,
    private readonly emailNotificationService: EmailNotificationService,
    private readonly userIdentityService: UserIdentityService,

    @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions,
  ) {
    this.usersService = this._AuthOptions.usersService;
    this.notificationSender = this._AuthOptions.notificationSender;
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
  async sendVerificationEmail(email: string): Promise<boolean> {
    const emailNotification = await this.createEmailNotification(email, NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION);
    if (!emailNotification) {
      throw new NotFoundException(EMAIL_ERRORS.USER_NOT_FOUND);
    }
    const mailOptions: IEmailOptions = {
      from: '"Company" <' + this._AuthOptions.constants.mail.auth.user + '>',
      to: email,
      subject: 'Verify Email',
      text: 'Verify Email',
      html:
        'Hi! <br><br> Thanks for your registration<br><br>' +
        '<a href=' +
        this._AuthOptions.constants.mail.links.emailVerification +
        '?token=' +
        emailNotification.token +
        '>Click here to activate your account</a>',
    }; //thir redirect to a page on the client that make a post to server /verify
    const sent = await this.notificationSender.notify(email, mailOptions);
    if (!sent) {
      throw new InternalServerErrorException(EMAIL_ERRORS.EMAIL_NOT_SENT);
    }
    return sent;
  }

  async resendVerificationEmail(email: string): Promise<boolean> {
    const firstEmail = await this.emailNotificationService.findOne({
      to: email,
      category: NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION,
    });
    if (!firstEmail) {
      throw new NotFoundException(EMAIL_ERRORS.USER_NOT_FOUND);
    }
    const sent = await this.sendVerificationEmail(email);
    if (!sent) {
      throw new InternalServerErrorException(EMAIL_ERRORS.EMAIL_NOT_SENT);
    }
    return sent;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const emailNotification = await this.emailNotificationService.findOne({
      token: token,
      category: NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION,
    });
    if (!emailNotification) {
      throw new NotFoundException(EMAIL_ERRORS.EMAIL_WRONG_VERIFY_CODE);
    }

    const user = await this.usersService.findByEmail(emailNotification.to);
    user.isVerified = true;
    const updatedUser = await this.usersService.updateById(user._id, user);
    await this.emailNotificationService.deleteById(emailNotification._id);
    return !!updatedUser;
  }

  async sendForgottenPasswordEmail(email: string): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException(LOGIN_ERRORS.USER_NOT_FOUND);

    const emailNotification = await this.createEmailNotification(email, NOTIFICATION_CATEGORY.RESET_CREDENTIALS);
    const mailOptions: IEmailOptions = {
      from: '"Company" <' + this._AuthOptions.constants.mail.auth.user + '>',
      to: email,
      subject: 'Frogotten Password',
      text: 'Forgot Password',
      html:
        'Hi! <br><br> If you requested to reset your password<br><br>' +
        '<a href=' +
        this._AuthOptions.constants.mail.links.forgotPassword +
        '?token=' +
        emailNotification.token +
        '>Click here</a>',
    }; //il link reindirizzerà ad una pagina del client in cui l'utente poi digiterà la propria nuova password

    const sent = await this.notificationSender.notify(email, mailOptions);
    if (!sent) {
      throw new InternalServerErrorException(EMAIL_ERRORS.EMAIL_NOT_SENT);
    }
    return sent;
  }

  async resetPassword(resetPwd: ResetPasswordDto): Promise<boolean> {
    return await this.resetFromToken(resetPwd.token, resetPwd.newPassword);
    //TODO maybe you also want to delete all refresh token for the user who own the token
  }

  private async resetFromToken(token: string, newPassword: string): Promise<boolean> {
    const notification = await this.emailNotificationService.findOne({
      category: NOTIFICATION_CATEGORY.RESET_CREDENTIALS,
      token: token,
    });
    if (!notification) {
      throw new UnauthorizedException(RESET_PASSWORD_ERRORS.WRONG_TOKEN);
    }
    if (!this.checkTimestampLimit(new Date(), notification.createdAt, 15)) {
      //if 15 min after token generation
      throw new UnauthorizedException(RESET_PASSWORD_ERRORS.TOKEN_EXPIRED);
    }
    await this.usersService.setPassword(notification.to, newPassword);
    await this.emailNotificationService.deleteById(notification._id);
    return true;
  }

  private async createEmailNotification(email: string, category: NOTIFICATION_CATEGORY): Promise<IEmailNotification> {
    const doc = await this.emailNotificationService.findOne({
      to: email,
      category: category,
    });

    if (doc && this.checkTimestampLimit(new Date(), doc.createdAt, 15)) {
      throw new ConflictException(EMAIL_ERRORS.EMAIL_SENT_RECENTLY);
    } else {
      const newDoc = await this.emailNotificationService.findOneAndUpdate(
        { to: email, category: category },
        {
          to: email,
          category: category,
          token: uuidv4(),
        },
        { upsert: true, new: true },
      );
      return newDoc;
    }
  }

  private checkTimestampLimit(first: Date, last: Date, limit: number): boolean {
    const value = (first.getTime() - last.getTime()) / 60000;
    return value < limit ? true : false;
  }
}

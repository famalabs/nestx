import {
  Injectable,
  Req,
  Inject,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TokenService } from './token/token.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { AUTH_OPTIONS, EMAIL_ERRORS, LOGIN_ERRORS, RESET_PASSWORD_ERRORS, SIGNUP_ERRORS } from './constants';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { ILoginResponse } from './interfaces/login-response.interface';
import { IUsersService } from './interfaces/users-service.interface';
import { User } from './dto/user';
import { IAuthenticationModuleOptions } from './interfaces/authentication-options.interface';
import { IEmailOptions } from './email/email-options.interface';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginResponseDto } from './dto';
import { EmailNotificationService } from './email/email-notification.service';
import { IEmailNotification, NOTIFICATION_CATEGORY } from './interfaces/notification.interface';
import { v4 as uuidv4 } from 'uuid';
import { IThirdPartyUser } from './interfaces/third-party-user.interface';
import * as crypto from 'crypto';
import { UserIdentityService } from './user-identity.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly emailNotificationService: EmailNotificationService,
    private readonly userIdentityService: UserIdentityService,
    @Inject(IUsersService) private readonly usersService: IUsersService,
    @Inject(AUTH_OPTIONS) private options: IAuthenticationModuleOptions,
  ) {}

  async signup(data: SignupDto): Promise<User> {
    const user = await this.usersService.findOne({ email: data.email });
    if (user) {
      throw new BadRequestException(SIGNUP_ERRORS.USER_ALREADY_EXISTS);
    }
    return await this.usersService.create({ email: data.email, password: data.password });
  }

  async login(credentials: LoginDto, ipAddress: string): Promise<ILoginResponse> {
    const user = await this.usersService.validateUser(credentials.email, credentials.password);
    if (!user) {
      throw new UnauthorizedException(LOGIN_ERRORS.WRONG_CREDENTIALS);
    }

    if (this.options.constants.blockNotVerifiedUser && !user.isVerified) {
      throw new UnauthorizedException(LOGIN_ERRORS.USER_NOT_VERIFIED);
    }
    return await this.createLoginResponse(user._id, credentials.clientId, ipAddress);
  }

  async validateThirdPartyIdentity(thirdPartyUser: IThirdPartyUser) {
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
    const user = await this.usersService.findOne({ email: thirdPartyUser.email });
    //if exists then throw a warning to the user
    if (user) {
      throw new UnauthorizedException(LOGIN_ERRORS.USER_NOT_LINKED);
    }
    //if not found, create new user + new userIdentity and login
    const randomPassword = crypto.randomBytes(64).toString('hex');
    const registeredUser = await this.usersService.create({
      email: thirdPartyUser.email,
      isSocial: true,
      isVerified: true,
      password: randomPassword,
    });
    await this.linkIdentity(thirdPartyUser, registeredUser._id);
    return registeredUser;
  }

  async thirdPartyLogin(userId: string, ipAddress: string): Promise<ILoginResponse> {
    return await this.createLoginResponse(userId, 'client id', ipAddress);
  }

  private async createLoginResponse(userId: string, clientId: string, ipAddress: string): Promise<ILoginResponse> {
    const payload: IJwtPayload = {
      sub: userId,
    };
    const accessToken = await this.tokenService.createAccessToken(payload);

    const tokenContent = {
      userId: userId,
      clientId: clientId,
      ipAddress,
    };
    const refreshToken = await this.tokenService.createRefreshToken(tokenContent);

    const loginResponse: ILoginResponse = {
      refreshToken: refreshToken.value,
      ...accessToken,
    };

    return loginResponse;
  }

  async linkIdentity(thirdPartyUser: IThirdPartyUser, userId: string): Promise<boolean> {
    const res = await this.userIdentityService.linkIdentity(thirdPartyUser, userId);
    if (!res) {
      throw new InternalServerErrorException('Error link UserIdentity');
    }
    return true;
  }

  async logout(userId: string, accessToken: string, refreshToken: string, fromAll: boolean): Promise<null> {
    if (fromAll) {
      await this.logoutFromAll(userId);
    } else {
      await this.logoutFromOne(refreshToken);
    }
    await this.tokenService.revokeToken(accessToken, userId);
    return null;
  }

  async sendVerificationEmail(email: string, serverAddress: string): Promise<boolean> {
    const emailNotification = await this.createEmailNotification(email, NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION);
    if (!emailNotification) {
      throw new NotFoundException(EMAIL_ERRORS.USER_NOT_FOUND);
    }
    const mailOptions: IEmailOptions = {
      from: '"Company" <' + this.options.constants.mail.auth.user + '>',
      to: email,
      subject: 'Verify Email',
      text: 'Verify Email',
      html:
        'Hi! <br><br> Thanks for your registration<br><br>' +
        '<a href=' +
        'clientAddress' +
        '/auth/email/verify/' +
        emailNotification.token +
        '>Click here to activate your account</a>',
    }; //thir redirect to a page on the client that make a post to server /verify
    const sent = await this.emailNotificationService.notify(email, mailOptions);
    if (!sent) {
      throw new InternalServerErrorException(EMAIL_ERRORS.EMAIL_NOT_SENT);
    }
    return sent;
  }

  async resendVerificationEmail(email: string, serverAddress: string): Promise<boolean> {
    const firstEmail = await this.emailNotificationService.findOne({
      to: email,
      category: NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION,
    });
    if (!firstEmail) {
      throw new NotFoundException(EMAIL_ERRORS.USER_NOT_FOUND);
    }
    const sent = await this.sendVerificationEmail(email, serverAddress);
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

    const user = await this.usersService.findOne({
      email: emailNotification.to,
    });
    user.isVerified = true;
    const updatedUser = await this.usersService.update(user._id, user);
    await this.emailNotificationService.delete({ _id: emailNotification._id });
    return !!updatedUser;
  }

  async sendForgottenPasswordEmail(email: string, serverAddress: string): Promise<boolean> {
    const user = await this.usersService.findOne({ email: email });
    if (!user) throw new NotFoundException(LOGIN_ERRORS.USER_NOT_FOUND);

    const emailNotification = await this.createEmailNotification(email, NOTIFICATION_CATEGORY.RESET_CREDENTIALS);
    let mailOptions: IEmailOptions = {
      from: '"Company" <' + this.options.constants.mail.auth.user + '>',
      to: email,
      subject: 'Frogotten Password',
      text: 'Forgot Password',
      html:
        'Hi! <br><br> If you requested to reset your password<br><br>' +
        '<a href=' +
        'clientAddress' +
        '/auth/email/reset-password?token=' +
        emailNotification.token +
        '>Click here</a>',
    }; //il link reindirizzerà ad una pagina del client in cui l'utente poi digiterà la propria nuova password

    const sent = await this.emailNotificationService.notify(email, mailOptions);
    if (!sent) {
      throw new InternalServerErrorException(EMAIL_ERRORS.EMAIL_NOT_SENT);
    }
    return sent;
  }

  async resetPassword(resetPwd: ResetPasswordDto): Promise<boolean> {
    return await this.resetFromToken(resetPwd.token, resetPwd.newPassword);
    //TODO maybe you also want to delete all refresh token for the user who own the token
  }

  async refreshToken(
    refreshToken: string,
    oldAccessToken: string,
    clientId: string,
    userIp: string,
  ): Promise<LoginResponseDto> {
    return await this.tokenService.getAccessTokenFromRefreshToken(refreshToken, oldAccessToken, clientId, userIp);
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

  private async logoutFromOne(refreshToken: string): Promise<null> {
    await this.tokenService.deleteRefreshToken(refreshToken);
    return null;
  }

  private async logoutFromAll(userId: string): Promise<null> {
    await this.tokenService.deleteAllRefreshTokenForUser(userId);
    return null;
  }

  private checkTimestampLimit(first: Date, last: Date, limit: number): boolean {
    const value = (first.getTime() - last.getTime()) / 60000;
    return value < limit ? true : false;
  }
}

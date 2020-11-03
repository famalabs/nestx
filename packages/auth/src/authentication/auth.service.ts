import {
  Injectable,
  Res,
  Req,
  Inject,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TokenService } from './token/token.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { Request, response, Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { AUTH_OPTIONS, EMAIL_ERRORS, LOGIN_ERRORS, RESET_PASSWORD_ERRORS } from './constants';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { ILoginResponse } from './interfaces/login-response.interface';
import { IForgottenPassword } from './interfaces/forgotten-password.interface';
import { ForgottenPassword } from './models/forgotten-password.model';
import { IUsersService } from './interfaces/users-service.interface';
import { User } from './dto/user';
import { EmailService } from './email/email.service';
import { IAuthenticationModuleOptions } from './interfaces/authentication-options.interface';
import { IEmailVerification } from './interfaces';
import { IEmailOptions } from './email/mail-options.interface';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginResponseDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    @Inject(IUsersService) private readonly usersService: IUsersService,
    @InjectModel(ForgottenPassword.name)
    private readonly forgottenPasswordModel: ReturnModelType<typeof ForgottenPassword>,
    @Inject(AUTH_OPTIONS) private options: IAuthenticationModuleOptions,
  ) {}

  async login(credentials: LoginDto, ipAddress: string): Promise<ILoginResponse> {
    const user = await this.usersService.validateUser(credentials.email, credentials.password);
    if (!user) {
      throw new NotFoundException(LOGIN_ERRORS.USER_NOT_FOUND);
    }
    if (user.isValid === false) {
      throw new UnauthorizedException(LOGIN_ERRORS.USER_NOT_VERIFIED);
    }
    if (user.isSocial === true) {
      throw new UnauthorizedException(LOGIN_ERRORS.USER_SOCIAL);
    }

    const payload: IJwtPayload = {
      sub: user._id,
    };
    const accessToken = await this.tokenService.createAccessToken(payload);

    const tokenContent = {
      userId: user._id,
      clientId: credentials.clientId,
      ipAddress,
    };
    const refreshToken = await this.tokenService.createRefreshToken(tokenContent);

    const loginResponse: ILoginResponse = {
      refreshToken: refreshToken.value,
      ...accessToken,
    };

    return loginResponse;
  }

  async signup(data: SignupDto): Promise<User> {
    const user: User = await this.usersService.create(data);
    const sent = await this.sendVerificationEmail(user.email);
    if (!sent) {
      throw new InternalServerErrorException(EMAIL_ERRORS.EMAIL_NOT_SENT);
    }
    return user;
  }

  async socialAccess(req: Request) {
    const payload: IJwtPayload = {
      sub: req.user['_id'],
    };

    const loginResponse: ILoginResponse = await this.tokenService.createAccessToken(payload);

    // We save the user's refresh token
    const tokenContent = {
      userId: req.user['_id'],
      clientId: '',
      ipAddress: req.ip,
    };
    const refresh = await this.tokenService.createRefreshToken(tokenContent);
    loginResponse.refreshToken = refresh.value;

    return loginResponse;
  }

  async logout(userId: string, accessToken: string, refreshToken: string, fromAll: boolean): Promise<any> {
    if (fromAll === true) {
      await this.logoutFromAll(userId);
    } else {
      await this.logoutFromOne(refreshToken);
    }
    await this.tokenService.revokeToken(accessToken, userId);
  }

  async sendVerificationEmail(email: string): Promise<boolean> {
    const emailRecord = await this.createEmailRecord(email);
    if (!emailRecord) {
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
        this.options.constants.system.host +
        ':' +
        this.options.constants.system.port +
        '/auth/email/verify/' +
        emailRecord.emailToken +
        '>Click here to activate your account</a>',
    };
    const sent = await this.emailService.sendEmail(email, mailOptions);
    return sent;
  }

  async resendVerificationEmail(email: string): Promise<boolean> {
    const firstEmail = await this.emailService.findOne({
      email: email,
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
    const email = await this.emailService.findOne({
      emailToken: token,
    });
    if (!email) {
      throw new NotFoundException(EMAIL_ERRORS.EMAIL_WRONG_VERIFY_CODE);
    }

    const user = await this.usersService.findOne({
      email: email.email,
    });
    user.isValid = true;
    const updatedUser = await this.usersService.update(user._id, user);
    await this.emailService.delete({ _id: email._id });
    return !!updatedUser;
  }

  async sendForgottenPasswordEmail(email: string): Promise<boolean> {
    const user = await this.usersService.findOne({ email: email });
    if (!user) throw new NotFoundException(LOGIN_ERRORS.USER_NOT_FOUND);

    const tokenModel = await this.createForgottenPasswordToken(email);

    let mailOptions: IEmailOptions = {
      from: '"Company" <' + this.options.constants.mail.auth.user + '>',
      to: email,
      subject: 'Frogotten Password',
      text: 'Forgot Password',
      html:
        'Hi! <br><br> If you requested to reset your password<br><br>' +
        '<a href=' +
        this.options.constants.system.host +
        ':' +
        this.options.constants.system.port +
        '/auth/email/reset-password/' +
        tokenModel.newPasswordToken +
        '>Click here</a>',
    }; //il link reindirizzerà ad una pagina del client in cui l'utente poi digiterà la propria nuova password

    const sent = await this.emailService.sendEmail(email, mailOptions);
    if (!sent) {
      throw new InternalServerErrorException(EMAIL_ERRORS.EMAIL_NOT_SENT);
    }
    return sent;
  }

  async resetPassword(resetPwd: ResetPasswordDto): Promise<any> {
    return await this.resetFromToken(resetPwd.token, resetPwd.newPassword);
  }

  async refreshToken(
    refreshToken: string,
    oldAccessToken: string,
    clientId: string,
    userIp: string,
  ): Promise<LoginResponseDto> {
    return await this.tokenService.getAccessTokenFromRefreshToken(refreshToken, oldAccessToken, clientId, userIp);
  }

  private async resetFromToken(token: string, newPassword: string) {
    const doc = await this.forgottenPasswordModel.findOne({
      newPasswordToken: token,
    });
    if (!doc) {
      throw new UnauthorizedException(RESET_PASSWORD_ERRORS.WRONG_TOKEN);
    }
    if (!this.checkTimestampLimit(new Date(), doc.timestamp, 15)) {
      //if 15 min after token generation
      throw new UnauthorizedException(RESET_PASSWORD_ERRORS.TOKEN_EXPIRED);
    }
    await this.usersService.setPassword(doc.email, newPassword);
    await doc.remove();
    return;
  }

  private async createEmailRecord(email: string): Promise<IEmailVerification> {
    const doc = await this.emailService.findOne({
      email: email,
    });

    if (doc && this.checkTimestampLimit(new Date(), doc.timestamp, 15)) {
      throw new ConflictException(EMAIL_ERRORS.EMAIL_SENT_RECENTLY);
    } else {
      const newDoc = await this.emailService.findOneAndUpdate(
        { email: email },
        {
          email: email,
          emailToken: (Math.floor(Math.random() * 9000000) + 1000000).toString(), //Generate 7 digits number
          timestamp: new Date(),
        },
        { upsert: true, new: true },
      );
      return newDoc;
    }
  }

  private async createForgottenPasswordToken(email: string): Promise<IForgottenPassword> {
    const doc = await this.forgottenPasswordModel.findOne({
      email: email,
    });
    if (doc && this.checkTimestampLimit(new Date(), doc.timestamp, 15)) {
      throw new ConflictException(EMAIL_ERRORS.EMAIL_SENT_RECENTLY);
    } else {
      const newDoc = await this.forgottenPasswordModel.findOneAndUpdate(
        { email: email },
        {
          email: email,
          newPasswordToken: (Math.floor(Math.random() * 9000000) + 1000000).toString(), //Generate 7 digits number,
          timestamp: new Date(),
        },
        { upsert: true, new: true },
      );
      return newDoc;
    }
  }

  private async logoutFromOne(refreshToken: string): Promise<any> {
    await this.tokenService.deleteRefreshToken(refreshToken);
  }

  private async logoutFromAll(userId: string): Promise<any> {
    await this.tokenService.deleteAllRefreshTokenForUser(userId);
  }

  private checkTimestampLimit(first: Date, last: Date, limit: number): boolean {
    const value = (first.getTime() - last.getTime()) / 60000;
    return value < limit ? true : false;
  }
}

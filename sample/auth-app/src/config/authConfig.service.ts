import { AuthOptions, AuthOptionsFactory } from '@famalabs/nestx-auth';
import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ACLManager } from '@famalabs/nestx-auth';
import { ExtractJwt } from 'passport-jwt';
import { EmailSenderService } from '../notification-sender.service';
import { UsersService } from '../users/user.service';

@Injectable()
export class AuthConfigService implements AuthOptionsFactory {
  constructor(private readonly usersService: UsersService, private readonly configService: ConfigService) {}
  createAuthOptions(): AuthOptions | Promise<AuthOptions> {
    return {
      logger: new Logger(),
      aclManager: new ACLManager(),
      notificationSender: new EmailSenderService(),
      constants: {
        blockNotVerifiedUser: false,
        jwt: {
          secret: this.configService.get<string>('JWT_TOKEN_SECRET'),
          signOptions: { expiresIn: parseInt(this.configService.get<string>('ACCESS_TOKEN_TTL'), 10) },
          tokenFromRequestExtractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
          accessTokenTTL: parseInt(this.configService.get<string>('ACCESS_TOKEN_TTL')) || 60 * 15, // 15 mins
          refreshTokenTTL: parseInt(this.configService.get<string>('REFRESH_TOKEN_TTL')) || 30, // 30 Days
        },
        mail: {
          auth: {
            user: this.configService.get<string>('MAIL_AUTH_USER'),
          },
          links: {
            emailVerification: 'http://localhost:3000',
            forgotPassword: 'http://localhost:3000',
          },
        },
        social: {
          facebook: {
            callbackURL: this.configService.get<string>('FACEBOOK_CALLBACK_URL'),
            clientID: this.configService.get<string>('FACEBOOK_CLIENT_ID'),
            clientSecret: this.configService.get<string>('FACEBOOK_CLIENT_SECRET'),
            linkIdentity: {
              callbackURL: this.configService.get<string>('FACEBOOK_LINK_CALLBACK_URL'),
            },
          },
          google: {
            callbackURL: this.configService.get<string>('GOOGLE_CALLBACK_URL'),
            clientID: this.configService.get<string>('GOOGLE_CLIENT_ID'),
            clientSecret: this.configService.get<string>('GOOGLE_SECRET'),
            linkIdentity: {
              callbackURL: this.configService.get<string>('GOOGLE_LINK_CALLBACK_URL'),
            },
          },
        },
      },
      usersService: this.usersService,
    };
  }
}

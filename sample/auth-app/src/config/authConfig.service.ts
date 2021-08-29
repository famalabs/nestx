import { AuthOptions, AuthOptionsFactory } from '@famalabs/nestx-auth';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/user.service';

@Injectable()
export class AuthConfigService implements AuthOptionsFactory {
  constructor(private readonly usersService: UsersService, private readonly configService: ConfigService) {}
  async createAuthOptions(): Promise<AuthOptions> {
    return {
      accessTokenConfig: {
        signOptions: {
          expiresIn: parseInt(this.configService.get<string>('ACCESS_TOKEN_TTL'), 10),
          secret: this.configService.get<string>('JWT_TOKEN_SECRET'),
        },
        verifyOptions: { secret: this.configService.get<string>('JWT_TOKEN_SECRET') },
      },

      refreshTokenConfig: {
        signOptions: {
          expiresIn: 30 * 24 * 60 * 60,
          secret: 'refresh_token_secret',
        },
        verifyOptions: {
          secret: 'refresh_token_secret',
        },
      },

      providers: {
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

      usersService: this.usersService,
    };
  }
}

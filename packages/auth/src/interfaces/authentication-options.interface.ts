import { CacheModuleOptions, LoggerService } from '@nestjs/common';
import { JwtModuleOptions } from '@nestjs/jwt';
import { IAuthModuleOptions } from '@nestjs/passport';

export interface IAuthLogger extends LoggerService {}

export type JwtFromRequestFunction = (req: any) => string | null;

export interface IAuthenticationModuleOptions {
  logger?: IAuthLogger;
  logging?: boolean;
  modules: {
    passport: IAuthModuleOptions;
    jwt: JwtModuleOptions;
    cache: CacheModuleOptions;
  };
  constants: {
    blockNotVerifiedUser: boolean;
    jwt: {
      accessTokenTTL: number;
      refreshTokenTTL: number;
      tokenFromRequestExtractor: JwtFromRequestFunction;
    };
    mail: {
      auth: {
        user: string;
      };
      links: {
        emailVerification: string;
        forgotPassword: string;
      };
    };
    social: {
      facebook: {
        callbackURL: string;
        clientID: string;
        clientSecret: string;
        linkIdentity: {
          callbackURL: string;
        };
      };
      google: {
        callbackURL: string;
        clientID: string;
        clientSecret: string;
        linkIdentity: {
          callbackURL: string;
        };
      };
    };
  };
}

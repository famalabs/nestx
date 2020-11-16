import { CacheModuleOptions } from '@nestjs/common';
import { JwtModuleOptions } from '@nestjs/jwt';
import { IAuthModuleOptions } from '@nestjs/passport';

export interface IAuthenticationModuleOptions {
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
    };
    mail: {
      host: string;
      port: number;
      secure: boolean;
      requireTLS: boolean;
      auth: {
        user: string;
        password: string;
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

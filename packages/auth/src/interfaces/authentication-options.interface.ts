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
    jwt: {
      accessTokenTTL: number;
      refreshTokenTTL: number;
    };
    mail: {
      host: string;
      port: number;
      auth: {
        user: string;
        password: string;
      };
    };
    system: {
      host: string;
      port: string;
    };
    social: {
      facebook: {
        callbackURL: string;
        clientID: string;
        clientSecret: string;
      };
      google: {
        callbackURL: string;
        clientID: string;
        clientSecret: string;
      };
    };
  };
}

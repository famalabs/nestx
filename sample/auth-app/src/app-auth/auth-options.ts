import 'dotenv/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { IAuthModuleOptions } from '@nestjs/passport';
import { CacheModuleOptions } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { IAuthenticationModuleOptions } from '@famalabs/nestx-auth';
/**
 * This object is used to pass options to @famalabs/nestx-auth
 * You must implement IAuthenticationModuleOptions
 */

const jwtModuleOptions: JwtModuleOptions = {
  secret: process.env.JWT_TOKEN_SECRET,
  signOptions: { expiresIn: parseInt(process.env.ACCESS_TOKEN_TTL, 10) },
};

const passportModuleOptions: IAuthModuleOptions = {};

const cacheModuleOptions: CacheModuleOptions = {
  store: redisStore,
  host: 'localhost',
  port: 6379,
  ttl: parseInt(process.env.ACCESS_TOKEN_TTL, 10),
};

export const authOptions: IAuthenticationModuleOptions = {
  modules: {
    jwt: jwtModuleOptions,
    passport: passportModuleOptions,
    cache: cacheModuleOptions,
  },
  constants: {
    blockNotVerifiedUser: false,
    jwt: {
      accessTokenTTL: parseInt(process.env.ACCESS_TOKEN_TTL, 10) || 60 * 15, // 15 mins
      refreshTokenTTL: parseInt(process.env.REFRESH_TOKEN_TTL, 10) || 30, // 30 Days
    },
    mail: {
      auth: {
        user: process.env.MAIL_AUTH_USER,
      },
      links: {
        emailVerification: 'http://localhost:3000',
        forgotPassword: 'http://localhost:3000',
      },
    },
    social: {
      facebook: {
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        linkIdentity: {
          callbackURL: process.env.FACEBOOK_LINK_CALLBACK_URL,
        },
      },
      google: {
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        linkIdentity: {
          callbackURL: process.env.GOOGLE_LINK_CALLBACK_URL,
        },
      },
    },
  },
};

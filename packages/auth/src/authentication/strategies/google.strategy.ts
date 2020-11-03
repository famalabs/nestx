import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import * as crypto from 'crypto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_OPTIONS, LOGIN_ERRORS } from './../constants';
import { IUsersService } from '../interfaces/users-service.interface';
import { User } from '../dto/user';
import { IAuthenticationModuleOptions } from '../interfaces';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(IUsersService) private usersService: IUsersService,
    @Inject(AUTH_OPTIONS) private options: IAuthenticationModuleOptions,
  ) {
    super({
      clientID: options.constants.social.google.clientID,
      clientSecret: options.constants.social.google.clientSecret,
      callbackURL: options.constants.social.google.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any, _done: VerifyCallback): Promise<any> {
    const user = await this.usersService.findOne({
      email: profile.emails[0].value,
    });
    if (user) {
      if (user.isSocial === true && user.socialProvider === 'google') {
        return user;
      } else {
        throw new UnauthorizedException(LOGIN_ERRORS.USER_SOCIAL + ` Try to use ${user.socialProvider}.`);
      }
    }

    let newUser: User = new User();
    newUser.email = profile.emails[0].value;
    newUser.isSocial = true;
    newUser.isValid = true;
    newUser.password = crypto.randomBytes(64).toString('hex');
    newUser.socialProvider = 'google';
    const res = await this.usersService.create(newUser);
    if (!res) {
      throw new UnauthorizedException();
    }
    return {
      _id: res._id,
    };
  }
}

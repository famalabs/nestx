import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { Strategy } from 'passport-facebook';
import { AUTH_OPTIONS, LOGIN_ERRORS } from './../constants';
import { User } from '../dto/user';
import { IUsersService } from '../interfaces/users-service.interface';
import { IAuthenticationModuleOptions } from '../interfaces';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    @Inject(IUsersService) private readonly usersService: IUsersService,
    @Inject(AUTH_OPTIONS) private options: IAuthenticationModuleOptions,
  ) {
    super({
      clientID: options.constants.social.facebook.clientID,
      clientSecret: options.constants.social.facebook.clientSecret,
      callbackURL: options.constants.social.facebook.callbackURL,
      profileFields: ['email'],
    });
  }

  public async validate(_accessToken: string, _refreshToken: string, profile: any): Promise<any> {
    const user = await this.usersService.findOne({
      email: profile.emails[0].value,
    });
    if (user) {
      if (user.isSocial === true && user.socialProvider === 'facebook') {
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
    newUser.socialProvider = 'facebook';
    const res = await this.usersService.create(newUser);
    if (!res) {
      throw new UnauthorizedException();
    }
    return {
      _id: res._id,
    };
  }
}

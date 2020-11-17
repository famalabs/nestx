import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Inject, Injectable } from '@nestjs/common';
import { AUTH_OPTIONS } from './../constants';
import { IAuthenticationModuleOptions } from '../interfaces';
import { IThirdPartyUser, THIRD_PARTY_PROVIDER } from '../interfaces/third-party-user.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    @Inject(AUTH_OPTIONS) private options: IAuthenticationModuleOptions,
  ) {
    super({
      clientID: options.constants.social.google.clientID,
      clientSecret: options.constants.social.google.clientSecret,
      callbackURL: options.constants.social.google.callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: false,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
    const thirdPartyUser: IThirdPartyUser = {
      externalId: profile.id,
      email: profile.emails[0].value,
      accessToken: accessToken,
      refreshToken: refreshToken,
      provider: THIRD_PARTY_PROVIDER.GOOGLE,
    };
    const user = await this.authService.validateThirdPartyIdentity(thirdPartyUser);
    return { _id: user._id };
  }
}

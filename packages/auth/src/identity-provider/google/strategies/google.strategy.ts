import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Inject, Injectable } from '@nestjs/common';
import { IThirdPartyUser, THIRD_PARTY_PROVIDER } from '../../../interfaces/oauth/third-party-user.interface';
import { AuthService } from '../../../auth.service';
import { AuthOptions } from '../../../interfaces/module/auth-options.interface';
import { AUTH_OPTIONS } from '../../../constants';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService, @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions) {
    super({
      clientID: _AuthOptions.constants.social.google.clientID,
      clientSecret: _AuthOptions.constants.social.google.clientSecret,
      callbackURL: _AuthOptions.constants.social.google.callbackURL,
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
    return { id: user._id, roles: user.roles };
  }
}

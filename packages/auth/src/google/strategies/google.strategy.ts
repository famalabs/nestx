import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { Inject, Injectable } from '@nestjs/common';
import { AuthOptions, IThirdPartyUser, THIRD_PARTY_PROVIDER } from '../../interfaces';
import { AuthService } from '../../auth.service';
import { AUTH_OPTIONS } from '../../constants';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService, @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions) {
    super({
      clientID: _AuthOptions.providers.google.clientID,
      clientSecret: _AuthOptions.providers.google.clientSecret,
      callbackURL: _AuthOptions.providers.google.callbackURL,
      scope: _AuthOptions.providers.google.scope || ['email', 'profile'],
      passReqToCallback: false,
      ..._AuthOptions.providers.google.strategyOptions,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
    const thirdPartyUser: IThirdPartyUser = {
      externalId: profile.id,
      email: profile.emails[0].value,
      accessToken: accessToken,
      provider: THIRD_PARTY_PROVIDER.GOOGLE,
    };
    const user = await this.authService.validateThirdPartyIdentity(thirdPartyUser);
    return { id: user._id, roles: user.roles };
  }
}

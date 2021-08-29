import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { Profile, Strategy } from 'passport-facebook';
import { AUTH_OPTIONS } from '../../constants';
import { AuthOptions, IJwtSub, IThirdPartyUser, THIRD_PARTY_PROVIDER } from '../../interfaces';
import { AuthService } from '../../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly authService: AuthService, @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions) {
    super({
      clientID: _AuthOptions.providers.facebook.clientID,
      clientSecret: _AuthOptions.providers.facebook.clientSecret,
      callbackURL: _AuthOptions.providers.facebook.callbackURL,
      profileFields: ['email'],
      passReqToCallback: false,
    });
  }
  public async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<IJwtSub> {
    const thirdPartyUser: IThirdPartyUser = {
      externalId: profile.id,
      email: profile.emails[0].value,
      accessToken: accessToken,
      provider: THIRD_PARTY_PROVIDER.FACEBOOK,
    };
    const user = await this.authService.validateThirdPartyIdentity(thirdPartyUser);
    return { id: user._id, roles: user.roles };
  }
}

import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { Profile, Strategy } from 'passport-facebook';
import { AUTH_OPTIONS } from '../../constants';
import { IThirdPartyUser, THIRD_PARTY_PROVIDER } from '../../interfaces/oauth/third-party-user.interface';
import { AuthService } from '../../auth.service';
import { AuthOptions } from '../../interfaces/module/auth-options.interface';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly authService: AuthService, @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions) {
    super({
      clientID: _AuthOptions.constants.social.facebook.clientID,
      clientSecret: _AuthOptions.constants.social.facebook.clientSecret,
      callbackURL: _AuthOptions.constants.social.facebook.callbackURL,
      profileFields: ['email'],
      passReqToCallback: false,
    });
  }
  public async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
    const thirdPartyUser: IThirdPartyUser = {
      externalId: profile.id,
      email: profile.emails[0].value,
      accessToken: accessToken,
      refreshToken: refreshToken,
      provider: THIRD_PARTY_PROVIDER.FACEBOOK,
    };
    const user = await this.authService.validateThirdPartyIdentity(thirdPartyUser);
    return { id: user._id, roles: user.roles };
  }
}

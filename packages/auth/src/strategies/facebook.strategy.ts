import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { Profile, Strategy } from 'passport-facebook';
import { AUTH_OPTIONS } from './../constants';
import { IAuthenticationModuleOptions } from '../interfaces';
import { IThirdPartyUser, THIRD_PARTY_PROVIDER } from '../interfaces/third-party-user.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly authService: AuthService,
    @Inject(AUTH_OPTIONS) private options: IAuthenticationModuleOptions,
  ) {
    super({
      clientID: options.constants.social.facebook.clientID,
      clientSecret: options.constants.social.facebook.clientSecret,
      callbackURL: options.constants.social.facebook.callbackURL,
      profileFields: ['email'],
    });
  }
  public async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    const thirdPartyUser: IThirdPartyUser = {
      externalId: profile.id,
      email: profile.emails[0].value,
      accessToken: accessToken,
      refreshToken: refreshToken,
      provider: THIRD_PARTY_PROVIDER.FACEBOOK,
    };
    const user = await this.authService.validateThirdPartyIdentity(thirdPartyUser);
    return { _id: user._id };
  }
}

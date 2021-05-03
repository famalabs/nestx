import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Profile, Strategy } from 'passport-facebook';
import { AUTH_OPTIONS, JWT_ERRORS } from '../../constants';
import { IThirdPartyUser, THIRD_PARTY_PROVIDER } from '../../interfaces/oauth/third-party-user.interface';
import { UserIdentityService } from '../../user-identity/user-identity.service';
import qs = require('qs');
import { TokenService } from '../../token/token.service';
import { AuthOptions } from '../../interfaces/module/auth-options.interface';

@Injectable()
export class FacebookLinkStrategy extends PassportStrategy(Strategy, 'facebook-link') {
  constructor(
    private readonly userIdentityService: UserIdentityService,
    private readonly tokenService: TokenService,
    @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions,
  ) {
    super({
      clientID: _AuthOptions.constants.social.facebook.clientID,
      clientSecret: _AuthOptions.constants.social.facebook.clientSecret,
      callbackURL: _AuthOptions.constants.social.facebook.linkIdentity.callbackURL,
      profileFields: ['email'],
      passReqToCallback: true,
    });
  }
  public async validate(req: any, accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
    const thirdPartyUser: IThirdPartyUser = {
      externalId: profile.id,
      email: profile.emails[0].value,
      accessToken: accessToken,
      refreshToken: refreshToken,
      provider: THIRD_PARTY_PROVIDER.FACEBOOK,
    };

    // take the state from the request query params
    const state = qs.parse(req.query.state);
    if (state === undefined) throw new BadRequestException('Missing state parameter.');

    //save the api access token
    const userToken = state['nestx_token'].toString();
    if (userToken === undefined) throw new BadRequestException("Missing user's token.");

    const payload = await this.tokenService.verifyAccessToken(userToken);
    const userId = payload.sub.userId;

    // check if identity exists
    const identity = await this.userIdentityService.findOne({
      externalId: thirdPartyUser.externalId,
      provider: thirdPartyUser.provider,
    });
    if (identity) throw new BadRequestException('Identity already exists.');

    //link identity
    await this.userIdentityService.linkIdentity(thirdPartyUser, userId);

    return { id: userId, roles: payload.sub.roles };
  }
}

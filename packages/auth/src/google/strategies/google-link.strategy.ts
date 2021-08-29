import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, StrategyOptionsWithRequest } from 'passport-google-oauth20';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import qs = require('qs');
import { TokenService } from '../../token';
import { AuthOptions, IJwtSub, IThirdPartyUser, THIRD_PARTY_PROVIDER } from '../../interfaces';
import { AUTH_OPTIONS } from '../../constants';
import { UserIdentityService } from '../../user-identity';

@Injectable()
export class GoogleLinkStrategy extends PassportStrategy(Strategy, 'google-link') {
  constructor(
    private readonly userIdentityService: UserIdentityService,
    private readonly tokenService: TokenService,
    @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions,
  ) {
    super({
      clientID: _AuthOptions.providers.google.clientID,
      clientSecret: _AuthOptions.providers.google.clientSecret,
      callbackURL: _AuthOptions.providers.google.linkIdentity.callbackURL,
      scope: _AuthOptions.providers.google.scope || ['email', 'profile'],
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: Profile): Promise<IJwtSub> {
    const thirdPartyUser: IThirdPartyUser = {
      externalId: profile.id,
      email: profile.emails[0].value,
      accessToken: accessToken,
      provider: THIRD_PARTY_PROVIDER.GOOGLE,
    };

    // take the state from the request query params
    const state = qs.parse(req.query.state);
    if (state === undefined) throw new BadRequestException('Missing state parameter.');

    //save the api access token
    const userToken = state['nestx_token'].toString();
    if (userToken === undefined) throw new BadRequestException("Missing user's token.");

    const payload = await this.tokenService.verifyAccessToken(userToken);
    const userId = payload.sub.id;

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

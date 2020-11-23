import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Profile, Strategy } from 'passport-facebook';
import { AUTH_OPTIONS, JWT_ERRORS } from '../constants';
import { IAuthenticationModuleOptions } from '../interfaces';
import { IThirdPartyUser, THIRD_PARTY_PROVIDER } from '../interfaces/third-party-user.interface';
import { UserIdentityService } from './../user-identity.service';
import qs = require('qs');
import { TokenService } from './../token/token.service';

@Injectable()
export class FacebookLinkStrategy extends PassportStrategy(Strategy, 'facebook-link') {
  constructor(
    private readonly userIdentityService: UserIdentityService,
    private readonly tokenService: TokenService,
    @Inject(AUTH_OPTIONS) private options: IAuthenticationModuleOptions,
  ) {
    super({
      clientID: options.constants.social.facebook.clientID,
      clientSecret: options.constants.social.facebook.clientSecret,
      callbackURL: options.constants.social.facebook.linkIdentity.callbackURL,
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

    //check if token is blacklisted and extract userId from the payload
    const isBlacklisted = await this.tokenService.isBlackListed(userToken);
    if (isBlacklisted) {
      throw new UnauthorizedException(JWT_ERRORS.TOKEN_BLACKLISTED);
    }
    const payload = await this.tokenService.validateToken(userToken, false);
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

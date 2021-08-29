import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { AUTH_OPTIONS } from '../constants';
import { AuthOptions, IJwtPayload, IJwtSub, JwtFromRequestFunction } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  tokenExtractor: JwtFromRequestFunction;

  constructor(@Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions) {
    super({
      jwtFromRequest:
        _AuthOptions.accessTokenConfig.tokenFromRequestExtractor || ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: _AuthOptions.accessTokenConfig.signOptions.secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: IJwtPayload, done: Function): Promise<IJwtSub> {
    return { id: payload.sub.id, roles: payload.sub.roles ? payload.sub.roles : [] };
  }
}

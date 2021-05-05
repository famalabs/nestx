import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { AUTH_OPTIONS } from '../constants';
import { AuthOptions, IJwtPayload, IJwtSub } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions) {
    super({
      jwtFromRequest: _AuthOptions.constants.jwt.tokenFromRequestExtractor,
      secretOrKey: _AuthOptions.jwtModuleConfig.secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: IJwtPayload, done: Function): Promise<IJwtSub> {
    return { id: payload.sub.id, roles: payload.sub.roles ? payload.sub.roles : [] };
  }
}

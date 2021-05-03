import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { IJwtPayload } from '../interfaces/oauth/jwt-payload.interface';
import { AUTH_OPTIONS, JWT_ERRORS, JWT_OPTIONS } from '../constants';
import { TokenService } from '../token/token.service';
import { Request } from 'express';
import { AuthOptions } from '../interfaces/module/auth-options.interface';
import { JwtModuleOptions } from '@nestjs/jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly tokenService: TokenService,
    @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions,
    @Inject(JWT_OPTIONS) private jwtOptions: JwtModuleOptions,
  ) {
    super({
      jwtFromRequest: _AuthOptions.constants.jwt.tokenFromRequestExtractor,
      secretOrKey: jwtOptions.secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: IJwtPayload, done: Function) {
    done(null, { id: payload.sub.userId, roles: payload.sub.roles ? payload.sub.roles : [] });
  }
}

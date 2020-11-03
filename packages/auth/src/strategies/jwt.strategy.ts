import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { AUTH_OPTIONS, JWT_ERRORS } from '../constants';
import { IAuthenticationModuleOptions } from '../interfaces';
import { TokenService } from '../token/token.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly tokenService: TokenService,
    @Inject(AUTH_OPTIONS) private options: IAuthenticationModuleOptions,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: options.modules.jwt.secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: IJwtPayload) {
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    const isBlacklisted = await this.tokenService.isBlackListed(accessToken);
    if (isBlacklisted) {
      throw new UnauthorizedException(JWT_ERRORS.TOKEN_BLACKLISTED);
    }
    return {
      _id: payload.sub,
    };
  }
}

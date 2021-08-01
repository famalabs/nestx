import { ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AUTH_OPTIONS, JWT_ERRORS } from '../constants';
import { JsonWebTokenError } from 'jsonwebtoken';
import { AuthOptions } from '..';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(@Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const bearerHeader = this._AuthOptions.constants.jwt.tokenFromRequestExtractor(request);
    if (!bearerHeader) {
      throw new UnauthorizedException(JWT_ERRORS.MISSING);
    }

    // avoid double execution when more JwtGuard are applied when binding SuperGuard Globally
    if (request.user) return true;
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }

  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException(JWT_ERRORS.TOKEN_NOT_VALID);
    }
    return super.handleRequest(err, user, info, context, status);
  }
}

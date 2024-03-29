import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { GRANT } from '..';
import { DECORATORS } from '../constants';
import { ACLType } from '../types';
import { ACLGuard } from './acl.guard';
import { JwtGuard } from '../../guards/jwt.guard';
import { AUTH_OPTIONS } from '../../constants';
import { AuthOptions, JwtFromRequestFunction } from '../../interfaces/module/auth-options.interface';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class SuperGuard implements CanActivate {
  tokenExtractor: JwtFromRequestFunction;

  constructor(
    @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions,
    private readonly jwtGuard: JwtGuard,
    private readonly aclGuard: ACLGuard,
  ) {
    this.tokenExtractor =
      _AuthOptions.accessTokenConfig.tokenFromRequestExtractor || ExtractJwt.fromAuthHeaderAsBearerToken();
  }

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const acl = this.getMetadataInfo<ACLType>(context, DECORATORS.ACL);
    if (!token || acl.includes(GRANT.ANY)) {
      return await this.aclGuard.canActivate(context);
    } else {
      const first = await this.jwtGuard.canActivate(context);
      const second = await this.aclGuard.canActivate(context);
      return first && second;
    }
  }

  private getMetadataInfo<T>(ctx: ExecutionContext, name: any): Array<T> {
    const classType = ctx.getClass();
    const handler = ctx.getHandler();

    // get class-level metadata
    const classMetadata = Reflect.getMetadata(name, classType) || [];
    // get route-level metadata
    const handlerMetadata = Reflect.getMetadata(name, handler) || [];

    //build metadata array
    return Array<T>(...classMetadata, ...handlerMetadata);
  }
}

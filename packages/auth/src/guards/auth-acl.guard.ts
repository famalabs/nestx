import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GRANT } from '../acl';
import { DECORATORS } from '../acl/constants';
import { ACLType } from '../acl/types';
import { ACLGuard } from '../acl/acl.guard';
import { JwtGuard } from './jwt.guard';

@Injectable()
export class SuperGuard implements CanActivate {
  constructor(private readonly jwtGuard: JwtGuard, private readonly aclGuard: ACLGuard) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['authorization'];
    const acl = this.getMetadataInfo<ACLType>(context, DECORATORS.ACL);
    console.log(token, acl);
    console.log(req.user);
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

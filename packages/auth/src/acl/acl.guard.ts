import { Injectable, CanActivate, ExecutionContext, Inject, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core/injector/module-ref';
import { Request } from 'express';
import { ACLContext, ACLType, ACL_MANAGER, Resolver } from './types';
import { ACLManager } from './acl-manager';
import { DECORATORS } from './constants';

@Injectable()
export class ACLGuard implements CanActivate {
  private readonly logger = new Logger(ACLGuard.name);

  constructor(@Inject(ACL_MANAGER) private readonly aclManager: ACLManager, private readonly moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const classType = context.getClass();
    const handler = context.getHandler();

    const acl = this.getMetadataInfo<ACLType>(context, DECORATORS.ACL);

    if (acl.length === 0) {
      return false;
    }

    const ctx = await this.buildACLContext(context, acl);

    this.logger.debug(
      `[BEFORE] ACLGuard class:${classType.name}, handler:${handler.name}, user:${ctx.user && ctx.user.id}, instance:${
        ctx.instance
      }`,
    );

    const permissions = await this.resolvePermissions(ctx);

    this.logger.debug(
      `[AFTER] ACLGuard class:${classType.name}, handler:${handler.name}, user:${ctx.user && ctx.user.id}, instance:${
        ctx.instance
      }`,
    );

    ctx.req['permissions'] = permissions;
    this.logger.debug(`Request passed with these permissions:[${permissions}]`);
    if (!permissions) {
      return false;
    }

    return true;
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

  private async buildACLContext(ctx: ExecutionContext, acl: Array<ACLType>): Promise<ACLContext> {
    const classType = ctx.getClass();
    const handler = ctx.getHandler();
    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.user;
    const instance = req['instance'];
    const controller = await this.moduleRef.get(classType, { strict: false }); // get controller reference
    const aclCtx: ACLContext = { controller, handler, user, instance, req, acl };
    return aclCtx;
  }

  private async resolvePermissions(ctx: ACLContext): Promise<Array<any> | null> {
    const permissions = []; // permissions
    const acl = ctx.acl;

    this.logger.debug(`RESOLVING ACL [${acl}] ...`);
    for (const role of acl) {
      this.logger.debug(`START EXEC FOR ${role}`);

      let name; // role name
      let allow = false;

      if (typeof role === 'string') {
        //if string find the specified resolver or the fallback rolesResolver
        name = role;
        allow = await this.execResolver(ctx, name);
      } else if (Array.isArray(role)) {
        //if it is an Array then exec all resolvers with and logic
        name = role;
        allow = await this.execArrayResolver(role, ctx);
      } else if (typeof role === 'function') {
        //if it is a resolver then execute it
        name = role.name;
        allow = await role(ctx);
      }

      if (allow) {
        if (Array.isArray(name)) {
          name.forEach(element => {
            if (typeof element === 'string') permissions.push(element);
            if (typeof element === 'function') permissions.push(element.name);
          });
        } else {
          permissions.push(name); // permission object
        }
      }
      this.logger.debug(`END EXEC FOR ${role}, ALLOW:${allow}`);
    }

    return permissions.length > 0 ? permissions : null;
  }

  private async execResolver(ctx: ACLContext, name: string): Promise<boolean> {
    const resolver = this.aclManager.getDynamicResolver(name);
    if (resolver === null) return await this.execFallbackResolver(ctx, name);
    return await resolver(ctx);
  }

  private async execArrayResolver(resolvers: Array<string | Resolver>, ctx: ACLContext): Promise<boolean> {
    let result;
    this.logger.debug(`ALL [${resolvers}] HAVE TO PASS`);

    const asyncEvery = async (arr, predicate) => {
      for (const e of arr) {
        if (!(await predicate(e))) return false;
      }
      return true;
    };
    return await asyncEvery(resolvers, async element => {
      if (typeof element === 'string') {
        result = await this.execResolver(ctx, element);
        this.logger.debug(`END EXEC FOR ${element}, ALLOW:${result}`);
        return result;
      } else if (typeof element === 'function') {
        result = await element(ctx);
        this.logger.debug(`END EXEC FOR ${element}, ALLOW:${result}`);
        return result;
      }
    });
  }

  private async execFallbackResolver(ctx: ACLContext, name: string): Promise<boolean> {
    return await this.aclManager.rolesResolver(ctx, name);
  }
}

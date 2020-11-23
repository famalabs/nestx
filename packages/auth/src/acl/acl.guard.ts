import { Injectable, CanActivate, ExecutionContext, Inject, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core/injector/module-ref';
import { Request } from 'express';
import { ACLContext, ACLType, ACL_MANAGER, RolesType } from './types';
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
    const roles = this.getMetadataInfo<RolesType>(context, DECORATORS.ROLES);

    if (acl.length === 0) {
      return false;
    }

    const ctx = await this.buildACLContext(context, acl, roles);

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
    // if (!permissions) {
    //   return false;
    // }

    const nOfRoles = roles ? roles.length : 0;
    if (permissions && permissions.length !== acl.length + nOfRoles) {
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

  private async buildACLContext(
    ctx: ExecutionContext,
    acl: Array<ACLType>,
    roles: Array<RolesType>,
  ): Promise<ACLContext> {
    const classType = ctx.getClass();
    const handler = ctx.getHandler();
    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.user;
    const instance = req['instance'];
    const controller = await this.moduleRef.get(classType, { strict: false }); // get controller reference
    const aclCtx: ACLContext = { controller, handler, user, instance, req, acl, roles };
    return aclCtx;
  }

  private async resolvePermissions(ctx: ACLContext): Promise<Array<any> | null> {
    const permissions = []; // permissions
    const acl = ctx.acl;
    const roles = ctx.roles;

    this.logger.debug(`RESOLVING ACL [${acl}] ...`);
    for (const role of acl) {
      this.logger.debug(`START EXEC FOR ${role}`);

      let name; // role name
      let allow = false;

      if (typeof role === 'string') {
        name = role;
        const resolver = this.aclManager.getDynamicResolver(name);
        if (resolver !== null) {
          allow = await resolver(ctx);
        }
      } else if (typeof role === 'function') {
        name = role.name;
        allow = await role(ctx);
      }
      if (allow) {
        permissions.push(name); // permission object
      }
      this.logger.debug(`END EXEC FOR ${role}, ALLOW: ${allow}`);
    }

    if (ctx.user && roles) {
      this.logger.debug(`RESOLVING ROLES [${roles}] ...`);
      const allow = await this.aclManager.rolesResolver(ctx);
      if (allow) {
        permissions.push(...roles);
      }
    }
    return permissions.length > 0 ? permissions : null;
  }
}

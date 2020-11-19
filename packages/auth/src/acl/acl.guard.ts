import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core/injector/module-ref';
import { DECORATORS } from '../ACLs/constants';
import { Request } from 'express';
import { ACLContext, ACL_MANAGER } from './types';
import { ACLManager } from './acl-manager';

@Injectable()
export class ACLGuard implements CanActivate {
  constructor(@Inject(ACL_MANAGER) private readonly aclManager: ACLManager, private readonly moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const classType = context.getClass();
    const handler = context.getHandler();

    const acls = this.createACLs(context);
    console.log(acls);

    //if no acl -> block
    if (acls.length === 0) {
      return false;
    }

    const ctx = await this.buildACLContext(context);

    //debug log
    console.log(ctx.controller);
    // eslint-disable-next-line prefer-const
    for (let [key, value] of this.aclManager.dynamicResolvers) {
      console.log(key + ' = ' + value);
    }
    console.log(ctx.user);

    // test print -> before resolveACL
    console.log('ACLGuard', classType.name, handler.name, 'user:', ctx.user && ctx.user.id, 'acl:', acls);

    // build permissions from current user, acl, ctx
    const permissions = await this.resolveACLWithContext(acls, ctx);

    // test print -> after resolveACL
    console.log(
      'ACLGuard',
      classType.name,
      handler.name,
      'user:',
      ctx.user && ctx.user.id,
      'permissions:',
      permissions,
    );

    //set permissions
    ctx.req.permissions = permissions;

    //if not permissions block user
    if (!permissions) {
      return false;
    }

    return true;
  }

  private createACLs(ctx: ExecutionContext): Array<any> {
    const classType = ctx.getClass();
    const handler = ctx.getHandler();

    // get class-level acl
    const classAcl = Reflect.getMetadata(DECORATORS.ACL, classType) || [];
    // get route-level acl
    const handlerAcl = Reflect.getMetadata(DECORATORS.ACL, handler) || [];
    //build acl array
    return [...handlerAcl, ...classAcl];
  }

  private async buildACLContext(ctx: ExecutionContext): Promise<ACLContext> {
    const classType = ctx.getClass();
    const handler = ctx.getHandler();
    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.user;
    const instance = req['instance'];
    const controller = await this.moduleRef.get(classType, { strict: false }); // get controller reference
    const aclCtx: ACLContext = { controller, handler, user, instance, req };
    return aclCtx;
  }

  private async resolveACLWithContext(acls: Array<any>, ctx: ACLContext): Promise<Array<any> | null> {
    const permissions = []; // permissions
    const user = ctx.user;
    for (const role of acls) {
      let name; // role name
      let allow = false;

      if (typeof role === 'string') {
        name = role;
        const resolver = this.aclManager.getResolver(role);
        if (resolver !== null) {
          allow = await resolver(ctx);
        } else if (user) {
          allow = await this.aclManager.matchRole(user, role);
        }
      } else if (typeof role === 'function') {
        name = role.name;
        allow = await role(ctx);
      }
      console.log('resolveACL', role, 'allow', allow);
      if (allow) {
        permissions.push(name); // permission object
      }
    }
    return permissions.length > 0 ? permissions : null;
  }
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, INestApplication } from '@nestjs/common';
import { DECORATORS } from '../acls';
import { ACLContext, RESOLVERS } from '../acls';

@Injectable()
export class ACLGuard implements CanActivate {
  constructor(private readonly app: INestApplication) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const classType = context.getClass();
    const handler = context.getHandler();
    const classAcl = Reflect.getMetadata(DECORATORS.ACL, classType) || [];
    const handlerAcl = Reflect.getMetadata(DECORATORS.ACL, handler) || [];
    const acl = [...handlerAcl, ...classAcl];
    if (acl.length === 0) {
      return true;
    }
    const [req, res, next] = context.getArgs();
    const user = req.user;
    const controller = this.app.get(classType); // get controller through type
    const ctx: ACLContext = { controller, handler, req, user };
    console.log('ACLGuard', classType.name, handler.name, 'user:', user && user.id, 'acl:', acl);
    const permissions = await resolveACL(user, acl, ctx);
    console.log('ACLGuard', classType.name, handler.name, 'user:', user && user.id, 'permissions:', permissions);
    req.permissions = permissions;
    if (!permissions) {
      throw new UnauthorizedException();
    }
    return true;
  }
}

async function resolveACL(user, acl, ctx) {
  const permissions = []; // permissions
  for (const role of acl) {
    let name; // role name
    let allow = false;
    if (typeof role === 'string') {
      name = role;
      if (RESOLVERS[role]) {
        allow = await RESOLVERS[role](ctx);
      } else if (user && user.roles instanceof Array) {
        allow = user.roles.indexOf(role) >= 0;
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

// function mergeRoles(src)

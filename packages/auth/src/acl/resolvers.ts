import { ACLResolvers, ACLContext } from './types';
import { Resolver } from './types';

export enum GRANT {
  ANY = 'ANY',
  AUTHENTICATED = 'AUTHENTICATED',
  OWNER = 'OWNER',
}

export const DynamicResolvers: ACLResolvers<GRANT> = new Map([
  [GRANT.ANY, any],
  [GRANT.AUTHENTICATED, authenticated],
  [GRANT.OWNER, owner],
]);

function any(ctx: ACLContext): boolean {
  return true;
}

function authenticated(ctx: ACLContext): boolean {
  return !!ctx.user;
}

function owner(ctx: ACLContext): boolean {
  //extract ctx info
  const { controller, handler, user, instance, req } = ctx;

  //if no req.user
  if (!user) {
    return false;
  }

  return matchId(instance.user, user.id);
}

function matchId(src, target) {
  if (src === undefined || src === null || target === undefined || target === null) {
    return false;
  }
  return typeof src === typeof target ? src === target : src.toString() === target.toString();
}

export const RolesResolver: Resolver = function (ctx: ACLContext, name: string): boolean {
  const user = ctx.user;
  const role = name;
  const allow = user.roles.indexOf(role) >= 0;
  return allow;
};

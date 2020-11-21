import { ACLResolvers, ACLContext } from '.';
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

  // const isUserModel = usersPaths.includes(req.route.path);
  // const paramsId = resolveId(req);
  // if (isUserModel) {
  //   return matchId(paramsId, user.id);
  // } else {
  return matchId(instance.user, user.id);
  // }
}

function matchId(src, target) {
  if (src === undefined || src === null || target === undefined || target === null) {
    return false;
  }
  return typeof src === typeof target ? src === target : src.toString() === target.toString();
}

export const RolesResolver: Resolver = function (ctx: ACLContext): boolean {
  const user = ctx.user;
  const roles = ctx.roles;
  let allow = true;
  roles.forEach(role => (allow = allow && user.roles.indexOf(role) >= 0));
  return allow;
};

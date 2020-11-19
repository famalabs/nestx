import { ACLResolvers, ACLContext } from '.';

export enum ROLE {
  ANY = 'ANY',
  AUTHENTICATED = 'AUTHENTICATED',
  OWNER = 'OWNER',
}

export const RESOLVERS: ACLResolvers<ROLE> = new Map([
  [ROLE.ANY, any],
  [ROLE.AUTHENTICATED, authenticated],
  [ROLE.OWNER, owner],
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
  console.log(instance);

  //if no req.user
  if (!user) {
    return false;
  }

  const paramsId = resolveId(req);
  const isUser = matchId(paramsId, user._id);
  if (isUser) {
    return true;
  } else {
    // the id in params reference to an entity that is not the user
    // check ownership
    return matchId(instance.user, user._id);
  }
}

function resolveId(req) {
  return req.params.id;
}

function matchId(src, target) {
  if (src === undefined || src === null || target === undefined || target === null) {
    return false;
  }
  return typeof src === typeof target ? src === target : src.toString() === target.toString();
}

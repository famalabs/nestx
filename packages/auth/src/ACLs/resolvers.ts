import { ROLE } from './constants';
import { ACLContext, Resolver } from './types';

export const RESOLVERS: { [key in ROLE]: Resolver } = {
  ANY: any,
  AUTHENTICATED: authenticated,
  OWNER: owner,
};

function any(ctx: ACLContext): boolean {
  return true;
}

function authenticated(ctx: ACLContext): boolean {
  return !!ctx.user;
}

async function owner(ctx: ACLContext): Promise<boolean> {
  const { controller, handler, user, req } = ctx;
  if (!user) {
    return false;
  }
  // console.log('OWNER', 'user', user.id, 'params', req.params, 'controller', controller.constructor.name);
  const isUserModel = controller.service.model === user.constructor;
  const id = resolveId(req);
  if (isUserModel) {
    return matchId(id, user.id);
  } else {
    // other models
    if (id !== undefined) {
      const resource = await controller.service.findById(id).catch(err => false);
      return matchId(resource.user, user.id);
    } else {
      const fk = resolveUserFk(req);
      return matchId(fk, user.id);
    }
  }
}

function resolveId(req) {
  return req.params.id;
}

function resolveUserFk(req) {
  return req.query.where && req.query.where.user; // or get body
}

function matchId(src, target) {
  if (src === undefined || src === null || target === undefined || target === null) {
    return false;
  }
  return typeof src === typeof target ? src === target : src.toString() === target.toString();
}

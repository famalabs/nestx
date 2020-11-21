import { Instance } from '../getInstance/instance.middleware';
import { Request } from 'express';

export interface ACLContext {
  controller: any;
  handler: Function;
  user: any;
  instance: Instance;
  req: Request;
  acl: Array<ACLType>;
  roles: Array<RolesType>;
}
export type Resolver = (context: ACLContext) => Promise<boolean> | boolean;

export type ACLType = string | Resolver;
export type RolesType = string;
export type ACLResolvers<T> = Map<T, Resolver>;

export const ACL_MANAGER = Symbol('ACL_MANAGER');

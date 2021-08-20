import { Instance } from '../middlewares/instance.middleware';
import { Request } from 'express';

export interface ACLContext {
  handler: Function;
  user: any;
  instance: Instance;
  req: Request;
  acl: Array<ACLType>;
}
export type Resolver = (context: ACLContext, name?: string) => Promise<boolean> | boolean;

export type ACLType = string | Resolver | Array<string | Resolver>;
export type ACLResolvers<T> = Map<T, Resolver>;

export const ACL_MANAGER = Symbol('ACL_MANAGER');

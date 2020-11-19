import { Instance } from '../getInstance/instance.middleware';

export interface ACLContext {
  controller: any;
  handler: Function;
  user: any;
  instance: Instance;
  req: any;
}
export type Resolver = (context: ACLContext) => Promise<boolean> | boolean;

export type ACLType = string | Resolver;

export type ACLResolvers<T> = Map<T, Resolver>;

export const ACL_MANAGER = Symbol('ACL_MANAGER');

export type Resolver = (context: ACLContext) => Promise<boolean> | boolean;

export interface ACLContext {
  controller: any;
  handler: Function;
  user: any;
  req: any;
}

export type ACLType = string | Resolver;

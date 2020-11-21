import { DynamicResolvers, RolesResolver } from './resolvers';
import { Resolver, ACLResolvers } from './types';

export class ACLManager {
  private _rolesResolver?: Resolver;
  private _dynamicResolvers?: ACLResolvers<any>;

  constructor(rolesResolver: Resolver = RolesResolver, dynamicResolvers: ACLResolvers<any> = DynamicResolvers) {
    this._rolesResolver = rolesResolver;
    this._dynamicResolvers = dynamicResolvers;
  }

  public getDynamicResolver(name: string): Resolver | null {
    const resolver = this.dynamicResolvers.get(name);
    return resolver ?? null;
  }

  public addDynamicResolvers(resolvers: ACLResolvers<any>) {
    this.dynamicResolvers = new Map([
      ...Array.from(this.dynamicResolvers.entries()),
      ...Array.from(resolvers.entries()),
    ]);
  }

  public get dynamicResolvers(): ACLResolvers<any> {
    return this._dynamicResolvers;
  }

  public set dynamicResolvers(resolvers: ACLResolvers<any>) {
    this._dynamicResolvers = resolvers;
  }

  public get rolesResolver(): Resolver {
    return this._rolesResolver;
  }

  public set rolesResolver(resolver: Resolver) {
    this._rolesResolver = resolver;
  }
}

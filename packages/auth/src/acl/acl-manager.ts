import { RESOLVERS } from './resolvers';
import { Resolver, ACLResolvers } from './types';

export type RoleMatcher = (user: any, role: string) => Promise<boolean>;

export class ACLManager {
  private _matchRole: RoleMatcher;
  private _dynamicResolvers?: ACLResolvers<any>;

  constructor(roleMatcher: RoleMatcher, resolvers: ACLResolvers<any> = RESOLVERS) {
    this._dynamicResolvers = resolvers;
    this._matchRole = roleMatcher;
  }

  public getResolver(name: string): Resolver | null {
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

  public get matchRole(): RoleMatcher {
    return this._matchRole;
  }

  public set matchRole(matcher: RoleMatcher) {
    this._matchRole = matcher;
  }
}

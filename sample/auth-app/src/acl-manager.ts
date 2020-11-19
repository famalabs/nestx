import { ACLManager, RoleMatcher } from '@famalabs/nestx-auth/acl/acl-manager';
const roleMatcher: RoleMatcher = async (user: any, role: string): Promise<boolean> => {
  return user.roles.indexOf(role) >= 0;
};

export const myACLManager = new ACLManager(roleMatcher);

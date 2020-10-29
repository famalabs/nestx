export const DECORATORS_PREFIX = "auth";
export const DECORATORS = {
  ACL: `${DECORATORS_PREFIX}/acl`,
};

export enum ROLE {
  ANY = "ANY",
  AUTHENTICATED = "AUTHENTICATED",
  OWNER = "OWNER",
}

export enum USER_ROLES {
  ADMIN = "ADMIN",
}

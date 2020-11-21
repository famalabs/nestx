import { SetMetadata } from '@nestjs/common';
import { DECORATORS } from './constants';
import { ACLType, RolesType } from './types';

export function ACL(...acls: ACLType[]) {
  return SetMetadata(DECORATORS.ACL, acls);
}

export function ROLES(...roles: RolesType[]) {
  return SetMetadata(DECORATORS.ROLES, roles);
}

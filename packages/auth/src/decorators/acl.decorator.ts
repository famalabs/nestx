import { SetMetadata } from '@nestjs/common';
import { DECORATORS } from '../acl/constants';
import { ACLType } from '../acl/types';

export function ACL(...acls: ACLType[]) {
  return SetMetadata(DECORATORS.ACL, acls);
}

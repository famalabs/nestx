import { SetMetadata } from '@nestjs/common';
import { ACLType, DECORATORS } from '../ACLs';

export function ACL(...acls: ACLType[]) {
  return SetMetadata(DECORATORS.ACL, acls);
}

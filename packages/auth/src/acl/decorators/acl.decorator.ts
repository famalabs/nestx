import { SetMetadata } from '@nestjs/common';
import { DECORATORS } from '../constants';
import { ACLType } from '../types';

export function ACL(...acls: ACLType[]) {
  return SetMetadata(DECORATORS.ACL, acls);
}

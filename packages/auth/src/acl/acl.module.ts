import { DynamicModule, Global, Module } from '@nestjs/common';
import { ACL_MANAGER } from './types';
import { ACLManager } from './acl-manager';

@Global()
@Module({})
export class ACLModule {
  public static register(aclManager: ACLManager): DynamicModule {
    return {
      module: ACLModule,
      providers: [
        {
          provide: ACL_MANAGER,
          useValue: aclManager,
        },
      ],
      exports: [
        {
          provide: ACL_MANAGER,
          useValue: aclManager,
        },
      ],
    };
  }
}

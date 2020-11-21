import { DynamicModule, Module } from '@nestjs/common';
import { ACLManager } from './acl';
import { AuthCoreModule } from './Auth-core.module';
import { IAuthenticationModuleOptions } from './interfaces';

@Module({})
export class AuthModule {
  public static forRoot(options: IAuthenticationModuleOptions, aclManager: ACLManager): DynamicModule {
    return {
      module: AuthModule,
      imports: [AuthCoreModule.forRoot(options,aclManager)],
      exports: [AuthCoreModule],
    };
  }
}

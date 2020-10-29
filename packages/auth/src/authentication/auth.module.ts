import { DynamicModule, Module } from '@nestjs/common';
import { AuthCoreModule } from './Auth-core.module';
import { IAuthenticationModuleOptions } from './interfaces';

@Module({})
export class AuthModule {
  public static forRoot(options: IAuthenticationModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [AuthCoreModule.forRoot(options)],
      exports: [AuthCoreModule],
    };
  }
}

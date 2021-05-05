import { DynamicModule, Module } from '@nestjs/common';
import { AuthCoreModule } from './auth-core.module';
import { AuthAsyncOptions, AuthOptions } from './interfaces';

@Module({})
export class AuthModule {
  public static register(authOptions: AuthOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [AuthCoreModule.register(authOptions)],
      exports: [AuthCoreModule],
    };
  }

  public static registerAsync(authOptions: AuthAsyncOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [AuthCoreModule.registerAsync(authOptions)],
      exports: [AuthCoreModule],
    };
  }
}

import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';
import { AuthModuleAsyncOptions, IAuthModuleOptions } from '@nestjs/passport';
import { AuthCoreModule } from './auth-core.module';
import { AuthAsyncOptions } from './interfaces/module/auth-async-options.interface';
import { AuthOptions } from './interfaces/module/auth-options.interface';

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

import {
  CacheModule,
  CacheModuleAsyncOptions,
  CacheModuleOptions,
  DynamicModule,
  Global,
  Module,
} from '@nestjs/common';
import { JwtModule, JwtModuleAsyncOptions, JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { AuthModuleAsyncOptions, IAuthModuleOptions, PassportModule } from '@nestjs/passport';

@Global()
@Module({})
export class PluginModule {
  public static register(options: PluginOptions): DynamicModule {
    return {
      module: PluginModule,
      imports: [
        PassportModule.register(options.passport),
        JwtModule.register(options.jwt),
        CacheModule.register(options.cache),
      ],
      exports: [PassportModule, JwtModule, CacheModule],
    };
  }

  public static registerAsync(options: PluginAsyncOptions): DynamicModule {
    return {
      module: PluginModule,
      imports: [
        PassportModule.registerAsync(options.passport),
        JwtModule.registerAsync(options.jwt),
        CacheModule.registerAsync(options.cache),
      ],
      exports: [PassportModule, JwtModule, CacheModule],
    };
  }
}
export interface PluginOptions {
  /**
   * Options for plugin modules used by Auth
   */
  passport: IAuthModuleOptions;
  jwt: JwtModuleOptions;
  cache: CacheModuleOptions;
}

export interface PluginAsyncOptions {
  /**
   * AsyncOptions for plugin modules used by Auth
   */
  passport: AuthModuleAsyncOptions;
  jwt: JwtModuleAsyncOptions;
  cache: CacheModuleAsyncOptions;
}

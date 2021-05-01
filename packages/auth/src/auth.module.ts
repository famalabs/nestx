import { DynamicModule, Global, Module } from '@nestjs/common';
import { AuthCoreModule } from './auth-core.module';
import { AuthAsyncOptions } from './interfaces/module/auth-async-options.interface';
import { AuthOptions } from './interfaces/module/auth-options.interface';
import { PluginAsyncOptions, PluginModule, PluginOptions } from './plugin-module/plugin.module';

@Module({})
export class AuthModule {
  public static register(authOptions: AuthOptions, pluginOptions: PluginOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [AuthCoreModule.register(authOptions), PluginModule.register(pluginOptions)],
      exports: [AuthCoreModule],
    };
  }

  public static registerAsync(authOptions: AuthAsyncOptions, pluginOptions: PluginAsyncOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [AuthCoreModule.registerAsync(authOptions), PluginModule.registerAsync(pluginOptions)],
      exports: [AuthCoreModule],
    };
  }
}

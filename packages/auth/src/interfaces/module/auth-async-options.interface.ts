/* Dependencies */
import { DynamicModule, ForwardReference, ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { AuthModuleAsyncOptions } from '@nestjs/passport';
import { AuthOptionsFactory } from './auth-options-factory.interface';

/* Interfaces */
import { AuthOptions } from './auth-options.interface';

export interface AuthAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  passportModuleConfig: AuthModuleAsyncOptions;
  jwtModuleConfig: JwtModuleAsyncOptions;
  imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
  inject?: any[];
  useExisting?: Type<AuthOptionsFactory>;
  useClass?: Type<AuthOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<AuthOptions> | AuthOptions;
}

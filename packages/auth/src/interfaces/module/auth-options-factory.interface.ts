import { AuthOptions } from './auth-options.interface';

export interface AuthOptionsFactory {
  createAuthOptions(): Promise<AuthOptions> | AuthOptions;
}

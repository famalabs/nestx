import { AUTH_OPTIONS } from './constants';
import { AuthOptions } from './interfaces/module/auth-options.interface';

export function createAuthProviders(options: AuthOptions) {
  return [
    {
      provide: AUTH_OPTIONS,
      useValue: options,
    },
  ];
}

import { AUTH_OPTIONS } from './constants';
import { AuthOptions } from './interfaces/module/auth-options.interface';

export function createAuthProviders(options: AuthOptions) {
  const passportModuleOptions = {
    provide: 'PassportOptions',
    useFactory: async (options: AuthOptions) => {
      return options.passportModuleConfig;
    },
    inject: [AUTH_OPTIONS],
  };

  const jwtModuleOptions = {
    provide: 'JwtOptions',
    useFactory: async (options: AuthOptions) => {
      return options.jwtModuleConfig;
    },
    inject: [AUTH_OPTIONS],
  };

  return [passportModuleOptions, jwtModuleOptions];
}

import { LoggerService } from '@nestjs/common';
import { JwtModuleOptions, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { IAuthModuleOptions } from '@nestjs/passport';
import { ACLManager } from '../../acl';
import { JWT_ERRORS } from '../../constants';
import { IThirdPartyProviderOptions } from '../oauth/third-party-providers-options.interface';
import { IUsersService } from '../user/users-service.interface';
import { AuthAsyncOptions } from './auth-async-options.interface';

export type JwtFromRequestFunction = (req: any) => string | null;

export interface AuthOptions {
  //
  // This interface describes the options you want to pass to
  // AuthModule.
  //

  /**
   * Service used to handle users auth
   */
  usersService: IUsersService;

  /**
   * Class used to handle permissions and resolvers.
   * Default value - {@link ACLManager}
   */
  aclManager?: ACLManager;
  /**
   * Logger for debug.
   * If no Logger provided, authModule doesn't log anything.
   */
  logger?: LoggerService;

  /**
   * If true, block not verified user on login.
   */
  blockNotVerifiedUser?: boolean;
  accessTokenConfig: AccessTokenConfig;
  refreshTokenConfig: RefreshTokenConfig;
  providers: {
    /**
     * Facebook config
     */
    facebook: IThirdPartyProviderOptions;

    /**
     * Google config
     */
    google: IThirdPartyProviderOptions;
  };
}

export interface AccessTokenConfig {
  signOptions: JwtSignOptions;
  verifyOptions: JwtVerifyOptions;
  tokenFromRequestExtractor?: JwtFromRequestFunction;
}

export interface RefreshTokenConfig {
  signOptions: JwtSignOptions;
  verifyOptions: JwtVerifyOptions;
}

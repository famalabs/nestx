import { LoggerService } from '@nestjs/common';
import { JwtModuleOptions, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { IAuthModuleOptions } from '@nestjs/passport';
import { ACLManager } from '../../acl';
import { INotificationSender } from '../notifications/notification-sender.interface';
import { IThirdPartyProviderOptions } from '../oauth/third-party-providers-options.interface';
import { IUsersService } from '../user/users-service.interface';

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
   * Class used to send notify
   */
  notificationSender: INotificationSender;

  /**
   * Class used to handle permissions and resolvers.
   * Default value - {@link ACLManager}
   */
  aclManager: ACLManager;
  /**
   * Logger for debug.
   * If no Logger provided, authModule doesn't log anything.
   */
  logger: LoggerService;

  /**
   * Configuration constants
   */
  constants: {
    /**
     * If true, block not verified user on login.
     */
    blockNotVerifiedUser: boolean;
    jwt: {
      /**
       * Time-to-live for refresh token
       */
      refreshTokenTTL: number;
      /**
       * Function that extract the accessToken from a request
       *
       * @param req request
       * @returns accessToken or null
       */
      tokenFromRequestExtractor: JwtFromRequestFunction;
    };
    mail: {
      /**
       * The email address of the organization (the sender)
       */
      auth: {
        user: string;
      };
      /**
       * Link for redirect in email body
       */
      links: {
        emailVerification: string;
        forgotPassword: string;
      };
    };
    social: {
      /**
       * Facebook config
       */
      facebook: IThirdPartyProviderOptions;

      /**
       * Google config
       */
      google: IThirdPartyProviderOptions;
    };
  };
  passportModuleConfig: IAuthModuleOptions;
  jwtModuleConfig: JwtModuleOptions;
}

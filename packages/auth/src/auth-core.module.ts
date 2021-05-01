import { Module, DynamicModule, Provider, Global, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { buildSchema } from '@typegoose/typegoose';
import { EmailNotification, RefreshToken, UserIdentity } from './models';
import { JwtStrategy, LocalStrategy } from './strategies';
import { EmailNotificationService } from './notification/email';
import { UserIdentityService } from './identity-provider/user-identity.service';
import { JwtGuard } from './guards';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthOptions } from './interfaces/module/auth-options.interface';
import { AuthAsyncOptions } from './interfaces/module/auth-async-options.interface';
import { AuthOptionsFactory } from './interfaces/module/auth-options-factory.interface';
import { AUTH_OPTIONS } from './constants';
import { createAuthProviders } from './auth.providers';
import { ACLGuard } from './acl';

import { RefreshTokenService } from './token/refresh-token.service';
import { AccessTokenService } from './token/access-token.service';
import { TokenService } from './token/token.service';
import { GoogleGuard, GoogleLinkGuard } from './google/guards';
import { GoogleLinkStrategy, GoogleStrategy } from './google/strategies';
import { GoogleController } from './google/google.controller';
import { FacebookMiddleware } from './facebook/middlewares/facebook.middleware';
import { FacebookLinkStrategy, FacebookStrategy } from './facebook/strategies';
import { FacebookGuard, FacebookLinkGuard } from './facebook/guards';
import { FacebookController } from './facebook/facebook.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailNotification.name, schema: buildSchema(EmailNotification) },
      { name: RefreshToken.name, schema: buildSchema(RefreshToken) },
      { name: UserIdentity.name, schema: buildSchema(UserIdentity) },
    ]),
  ],
  providers: [
    AuthService,
    AccessTokenService,
    RefreshTokenService,
    TokenService,
    LocalStrategy,
    UserIdentityService,
    JwtStrategy,
    EmailNotificationService,
    JwtGuard,
    ACLGuard,
    GoogleGuard,
    GoogleLinkGuard,
    GoogleLinkStrategy,
    GoogleStrategy,
    FacebookGuard,
    FacebookLinkGuard,
    FacebookLinkStrategy,
    FacebookStrategy,
  ],
  controllers: [AuthController, GoogleController, FacebookController],
  exports: [
    AuthService,
    TokenService,
    LocalStrategy,
    JwtStrategy,
    EmailNotificationService,
    JwtGuard,
    ACLGuard,
    GoogleGuard,
    GoogleLinkGuard,
    GoogleLinkStrategy,
    GoogleStrategy,
    FacebookGuard,
    FacebookLinkGuard,
    FacebookLinkStrategy,
    FacebookStrategy,
    UserIdentityService,
  ],
})
export class AuthCoreModule {
  /**
   * Registers a configured Auth Module for import into the current module
   */
  public static register(options: AuthOptions): DynamicModule {
    const providers = createAuthProviders(options);
    return {
      module: AuthCoreModule,
      providers: [...providers],
      exports: [...providers],
    };
  }

  /**
   * Registers a configured Auth Module for import into the current module
   * using dynamic options (factory, etc)
   */
  public static registerAsync(options: AuthAsyncOptions): DynamicModule {
    const providers = this.createProviders(options);
    return {
      module: AuthCoreModule,
      imports: options.imports || [],
      providers: [...providers],
      exports: [...providers],
    };
  }

  private static createProviders(options: AuthAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createOptionsProvider(options)];
    }

    // for useClass
    return [
      this.createOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createOptionsProvider(options: AuthAsyncOptions): Provider {
    if (options.useFactory) {
      // For useFactory...
      return {
        provide: AUTH_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    // For useExisting...
    return {
      provide: AUTH_OPTIONS,
      useFactory: async (optionsFactory: AuthOptionsFactory) => await optionsFactory.createAuthOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }

  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
    consumer.apply(FacebookMiddleware).forRoutes('auth/facebook/*');
    consumer.apply(FacebookMiddleware).forRoutes('auth/connect/facebook/*');
  }
}

import { Module, DynamicModule, Provider, Global, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { buildSchema } from '@typegoose/typegoose';
import { EmailNotification, RefreshToken, UserIdentity } from './models';
import {
  FacebookLinkStrategy,
  FacebookStrategy,
  GoogleLinkStrategy,
  GoogleStrategy,
  JwtStrategy,
  LocalStrategy,
} from './strategies';
import { TokenService } from './token/token.service';
import { EmailNotificationService } from './notification/email';
import { UserIdentityService } from './user-identity.service';
import { ACLGuard, JwtGuard } from './guards';
import { FacebookMiddleware } from './middlewares/facebook.middleware';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthOptions } from './interfaces/auth-options.interface';
import { AuthAsyncOptions } from './interfaces/auth-async-options.interface';
import { AuthOptionsFactory } from './interfaces/auth-options-factory.interface';
import { AUTH_OPTIONS } from './constants';
import { createAuthProviders } from './auth.providers';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: buildSchema(RefreshToken) },
      { name: EmailNotification.name, schema: buildSchema(EmailNotification) },
      { name: UserIdentity.name, schema: buildSchema(UserIdentity) },
    ]),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    FacebookStrategy,
    GoogleStrategy,
    FacebookLinkStrategy,
    GoogleLinkStrategy,
    TokenService,
    EmailNotificationService,
    UserIdentityService,
    JwtGuard,
    ACLGuard,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    FacebookStrategy,
    GoogleStrategy,
    FacebookLinkStrategy,
    GoogleLinkStrategy,
    TokenService,
    EmailNotificationService,
    UserIdentityService,
    JwtGuard,
    ACLGuard,
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
    consumer.apply(FacebookMiddleware).forRoutes('auth/facebook/*');
    consumer.apply(FacebookMiddleware).forRoutes('auth/connect/facebook/*');
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
  }
}

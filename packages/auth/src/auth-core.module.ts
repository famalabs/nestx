import { DynamicModule, HttpModule, MiddlewareConsumer, Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { buildSchema } from '@typegoose/typegoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AUTH_OPTIONS, JWT_OPTIONS, PASSPORT_OPTIONS } from './constants';
import { JwtGuard } from './guards';
import { AuthAsyncOptions, AuthOptions, AuthOptionsFactory } from './interfaces';
import { EmailNotification, RefreshToken, UserIdentity } from './models';
import { EmailNotificationService } from './notification';
import { JwtStrategy, LocalStrategy } from './strategies';
import { AccessTokenService, RefreshTokenService, TokenService } from './token';
import {
  GoogleController,
  GoogleGuard,
  GoogleLinkGuard,
  GoogleLinkStrategy,
  GoogleStrategy,
} from './identity-provider/google';
import {
  FacebookController,
  FacebookGuard,
  FacebookLinkGuard,
  FacebookLinkStrategy,
  FacebookStrategy,
} from './identity-provider/facebook';
import { UserIdentityService } from './identity-provider';
import { ACLGuard } from './acl';
import { LoggerMiddleware } from './middlewares';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailNotification.name, schema: buildSchema(EmailNotification) },
      { name: RefreshToken.name, schema: buildSchema(RefreshToken) },
      { name: UserIdentity.name, schema: buildSchema(UserIdentity) },
    ]),
    HttpModule,
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
    const authModuleOptions = {
      provide: AUTH_OPTIONS,
      useValue: options,
    };

    const passportModuleOptions = {
      provide: PASSPORT_OPTIONS,
      useFactory: async (options: AuthOptions) => {
        return options.passportModuleConfig;
      },
      inject: [AUTH_OPTIONS],
    };

    const jwtModuleOptions = {
      provide: JWT_OPTIONS,
      useFactory: async (options: AuthOptions) => {
        return options.jwtModuleConfig;
      },
      inject: [AUTH_OPTIONS],
    };

    const providers = [authModuleOptions, passportModuleOptions, jwtModuleOptions];
    return {
      module: AuthCoreModule,
      imports: [PassportModule.register(options.passportModuleConfig), JwtModule.register(options.jwtModuleConfig)],
      providers: [...providers],
      exports: [...providers],
    };
  }

  /**
   * Registers a configured Auth Module for import into the current module
   * using dynamic options (factory, etc)
   */
  public static registerAsync(options: AuthAsyncOptions): DynamicModule {
    const providers = this.createAsyncProviders(options);

    return {
      module: AuthCoreModule,
      imports: [
        ...options.imports,
        PassportModule.registerAsync(options.passportModuleConfig),
        JwtModule.registerAsync(options.jwtModuleConfig),
      ],
      providers: [...providers],
      exports: [...providers],
    };
  }

  private static createAsyncProviders(options: AuthAsyncOptions): Provider[] {
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
  }
}

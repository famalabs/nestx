import { Module, MiddlewareConsumer, DynamicModule, CacheModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookMiddleware } from './middlewares/facebook.middleware';
import { RefreshToken } from './models/refresh-token.model';
import { TokenService } from './token/token.service';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { IAuthenticationModuleOptions } from './interfaces';
import { AUTH_OPTIONS } from './constants';
import { EmailNotification } from './models/email-notification.model';
import { UserIdentity } from './models/user-identity.model';
import { UserIdentityService } from './user-identity.service';
import { FacebookLinkStrategy } from './strategies/facebook-link.strategy';
import { GoogleLinkStrategy } from './strategies/google-link.strategy';
import { EmailNotificationService } from './notification/email';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshToken.schema },
      { name: EmailNotification.name, schema: EmailNotification.schema },
      { name: UserIdentity.name, schema: UserIdentity.schema },
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
  ],
})
export class AuthCoreModule {
  public static forRoot(options: IAuthenticationModuleOptions): DynamicModule {
    return {
      module: AuthCoreModule,
      imports: [
        PassportModule.register(options.modules.passport),
        JwtModule.register(options.modules.jwt),
        CacheModule.register(options.modules.cache),
      ],
      providers: [{ provide: AUTH_OPTIONS, useValue: options }],
    };
  }

  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(FacebookMiddleware).forRoutes('auth/facebook/*');
    consumer.apply(FacebookMiddleware).forRoutes('auth/connect/facebook/*');
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
  }
}

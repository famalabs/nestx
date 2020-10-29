import {
  Module,
  MiddlewareConsumer,
  DynamicModule,
  CacheModule,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthController } from "./auth.controller";
import { FacebookStrategy } from "./strategies/facebook.strategy";
import { GoogleStrategy } from "./strategies/google.strategy";
import { FacebookMiddleware } from "./middlewares/facebook.middleware";
import { RefreshToken } from "./models/refresh-token.model";
import { TokenService } from "./token/token.service";
import { EmailVerification } from "./models/email-verification.model";
import { ForgottenPassword } from "./models/forgotten-password.model";
import { LoggerMiddleware } from "./middlewares/logger.middleware";
import { EmailService } from "./email/email.service";
import { MongooseModule } from "@nestjs/mongoose/dist/mongoose.module";
import { IAuthenticationModuleOptions } from "./interfaces";
import { AUTH_OPTIONS } from "./constants";
import { JwtGuard } from "./guards";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshToken.schema },
      { name: EmailVerification.name, schema: EmailVerification.schema },
      { name: ForgottenPassword.name, schema: ForgottenPassword.schema },
    ]),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    FacebookStrategy,
    GoogleStrategy,
    TokenService,
    EmailService,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    FacebookStrategy,
    GoogleStrategy,
    TokenService,
    EmailService,
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
    consumer.apply(FacebookMiddleware).forRoutes("auth/facebook/*");
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
  }
}

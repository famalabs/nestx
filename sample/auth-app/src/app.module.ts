import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { BooksModule } from './books/books.module';
import { AuthConfigService, JwtConfigService, PassportConfigService } from './config';
import { AuthController, AuthModule, FacebookController, GoogleController, SuperGuard } from '@famalabs/nestx-auth';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      autoIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }),
    UsersModule,
    AuthModule.registerAsync({
      jwtModuleConfig: { useClass: JwtConfigService },
      passportModuleConfig: {
        useClass: PassportConfigService,
      },
      imports: [UsersModule], // need this import in order to resolve the dependencies  for user model in AuthConfigService
      useClass: AuthConfigService,
    }),
    BooksModule,
  ],
  controllers: [AppController, AuthController, GoogleController, FacebookController],
  providers: [
    PassportConfigService,
    JwtConfigService,
    AuthConfigService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: SuperGuard,
    },
  ],
})
export class AppModule {}

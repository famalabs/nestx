import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { BooksModule } from './books/books.module';
import { AuthModule } from '@famalabs/nestx-auth';
import { SuperGuard } from '@famalabs/nestx-auth';
import { PassportConfigService, JwtConfigService, AuthConfigService } from './config';

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
    AuthModule.registerAsync(
      {
        imports: [UsersModule], // need this import in order to resolve the dependencies  for user model in AuthConfigService
        useClass: AuthConfigService,
      },
      {
        passport: {
          useClass: PassportConfigService,
        },
        jwt: {
          useClass: JwtConfigService,
        },
      },
    ),
    BooksModule,
  ],
  controllers: [AppController],
  providers: [
    AuthConfigService,
    PassportConfigService,
    JwtConfigService,
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

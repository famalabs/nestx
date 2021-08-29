import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { BooksModule } from './books/books.module';
import { AuthConfigService } from './config';
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
      imports: [UsersModule],
      useClass: AuthConfigService,
    }),
    BooksModule,
  ],
  controllers: [AppController, AuthController, GoogleController, FacebookController],
  providers: [
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

import 'dotenv/config';
import { Logger, LoggerService, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { AppAuthModule } from './app-auth/app-auth.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { BooksModule } from './books/books.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI, {
      autoIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }),
    UsersModule,
    AppAuthModule,
    BooksModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}

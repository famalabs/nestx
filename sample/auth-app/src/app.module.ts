import 'dotenv/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AppAuthModule } from './app-auth/app-auth.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { BooksModule } from './books/books.module';
import { ACLGuard, ACLModule } from '@famalabs/nestx-auth';
import { myACLManager } from './acl-manager';

@Module({
  imports: [
    ACLModule.forRoot(myACLManager),
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
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: ACLGuard,
    // },
  ],
})
export class AppModule {}

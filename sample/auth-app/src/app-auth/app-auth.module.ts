import { Global, Module } from '@nestjs/common';
import { AuthUsersService } from './auth-users.service';
import { UsersModule } from '../users/users.module';
import { authOptions } from './auth-options';
import { AuthModule, IUsersService, INotificationSender, SuperGuard } from '@famalabs/nestx-auth';
import { EmailSenderService } from './notification-sender.service';
import { myACLManager } from 'src/acl-manager';
import { APP_GUARD } from '@nestjs/core';
/**
 * This module is used to import the AuthModule from @famalabs/nestx-auth
 * You must declare it Global() in order to provide the injection of AuthUsersService to @famalabs/nestx-auth based on IUsersService symbol
 * and resolve dependencies of AuthUsersService and EmailSenderService
 */

@Global()
@Module({
  imports: [AuthModule.forRoot(authOptions, myACLManager), UsersModule],
  providers: [
    { provide: IUsersService, useClass: AuthUsersService },
    { provide: INotificationSender, useClass: EmailSenderService },
    {
      provide: APP_GUARD,
      useClass: SuperGuard,
    },
  ],
  exports: [IUsersService, INotificationSender],
})
export class AppAuthModule {}

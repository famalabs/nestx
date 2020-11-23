import { Global, Module } from '@nestjs/common';
import { AuthUsersService } from './auth-users.service';
import { UsersModule } from '../users/users.module';
import { authOptions } from './auth-options';
import { AuthModule, IUsersService, INotificationSender } from '@famalabs/nestx-auth';
import { EmailSenderService } from './notification-sender.service';
import { myACLManager } from 'src/acl-manager';
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
  ],
  exports: [IUsersService, INotificationSender],
})
export class AppAuthModule {}

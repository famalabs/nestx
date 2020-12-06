import { ACL, GRANT } from '@famalabs/nestx-auth';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { USER_ROLES } from './users/user.model';

@Controller('app')
export class AppController {
  // allow any
  @Get('public')
  @ACL(GRANT.ANY)
  @ApiBearerAuth()
  public(): string {
    return 'Hello from public route!';
  }

  // allow only authenticated users
  @Get('authenticated')
  @ACL(GRANT.AUTHENTICATED)
  @ApiBearerAuth()
  authenticated(): string {
    return 'Hello from private route!';
  }

  // allow only users with role ADMIN
  @Get('admin')
  @ACL(USER_ROLES.ADMIN)
  @ApiBearerAuth()
  admin(): string {
    return 'Hello from private admin route!';
  }

  // allow only users with role ADMIN+KING
  @Get('private-admin-king')
  @ACL([USER_ROLES.ADMIN, USER_ROLES.KING])
  @ApiBearerAuth()
  arrayResolvers(): string {
    return 'Hello you have permission!';
  }

  // allow users with role ADMIN+KING
  //              or
  //  allow authenticated users
  @Get('private-admin-and-king-or-auth')
  @ACL([USER_ROLES.ADMIN, USER_ROLES.KING], GRANT.AUTHENTICATED)
  @ApiBearerAuth()
  arrayResolversOrAuthenticated(): string {
    return 'Hello you have permission!';
  }
}

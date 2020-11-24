import { ACL, GRANT } from '@famalabs/nestx-auth';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { USER_ROLES } from './users/user.model';

@Controller('app')
export class AppController {
  // test with any grant
  @Get('public')
  @ACL(GRANT.ANY)
  @ApiBearerAuth()
  public(): string {
    return 'Hello from public route!';
  }

  // test with any grant
  @Get('private')
  @ACL(GRANT.AUTHENTICATED)
  @ApiBearerAuth()
  private(): string {
    return 'Hello from private route!';
  }

  //test with fallback resolver
  @Get('private-admin')
  @ACL(USER_ROLES.ADMIN)
  @ApiBearerAuth()
  privateAdmin(): string {
    return 'Hello from private admin route!';
  }

  //test with fallback resolver
  @Get('private-admin-king')
  @ACL([USER_ROLES.ADMIN, USER_ROLES.KING], GRANT.AUTHENTICATED)
  @ApiBearerAuth()
  arrayResolvers(): string {
    return 'Hello you have permission forever && ever!';
  }
}

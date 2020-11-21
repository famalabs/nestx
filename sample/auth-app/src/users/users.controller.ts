import { ACL, ROLES, GRANT } from '@famalabs/nestx-auth';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { USER_ROLES } from './user.model';

@ApiTags('users')
@Controller('user')
export class UsersController {
  @Get('private-admin')
  @ACL(GRANT.AUTHENTICATED)
  @ROLES(USER_ROLES.ADMIN)
  public(): string {
    return 'Hello from private admin route!';
  }

  @Get('private')
  @ACL(GRANT.AUTHENTICATED)
  @ApiBearerAuth()
  protectedPrivate(): string {
    return 'Hello from private route!';
  }
}

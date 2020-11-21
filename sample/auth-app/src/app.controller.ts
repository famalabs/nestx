import { ACL, GRANT } from '@famalabs/nestx-auth';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('app')
export class AppController {
  @Get('public')
  @ACL(GRANT.ANY)
  @ApiBearerAuth() // test for public route with an expired or invalid token provided TODO test
  public(): string {
    return 'Hello from public route!';
  }

  @Get('private')
  @ACL(GRANT.AUTHENTICATED)
  @ApiBearerAuth()
  private(): string {
    return 'Hello from private route!';
  }
}

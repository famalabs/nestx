import { JwtGuard, ACL, ACLGuard } from '@famalabs/nestx-auth';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('user')
export class UsersController {
  @Get('public')
  @UseGuards(ACLGuard)
  @ACL('admin')
  public(): string {
    return 'hello from public';
  }

  @Get('protected-jwt')
  @ApiBearerAuth()
  @UseGuards(JwtGuard, ACLGuard)
  protectedJwt(): string {
    return 'hello from protected';
  }
}

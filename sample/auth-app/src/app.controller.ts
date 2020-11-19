import { JwtGuard, ACL, ACLGuard, ROLE } from '@famalabs/nestx-auth';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('public')
  @ACL('admin')
  public(): string {
    return this.appService.getPublic();
  }

  @Get('protected-jwt')
  @ApiBearerAuth()
  @ACL(ROLE.ANY)
  @UseGuards(JwtGuard, ACLGuard) //-> middleware TODO
  protectedJwt(): string {
    return this.appService.getJwt();
  }
}

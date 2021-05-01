import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import { User } from '../decorators';
import { LoginResponseDto } from '../dto';
import { JwtGuard } from '../guards';
import { GoogleGuard, GoogleLinkGuard } from './guards';

@Controller('google')
export class GoogleController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiOperation({ summary: 'Google login/signup' })
  @UseGuards(GoogleGuard)
  async googleAuth(@Req() req, @Res() res) {
    return;
  }

  @Get('redirect')
  @ApiOperation({ summary: 'Google login/signup redirect' })
  @UseGuards(GoogleGuard)
  async googleAuthRedirect(@User() user): Promise<LoginResponseDto> {
    return await this.authService.thirdPartyLogin(user.id, user.roles);
  }

  @Get('connect')
  @ApiOperation({ summary: 'Google link identity' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, GoogleLinkGuard)
  async linkGoogleIdentity(@Req() req, @Res() res) {
    return;
  }

  @Get('connect/redirect')
  @ApiOperation({ summary: 'Google link identity redirect' })
  @UseGuards(GoogleLinkGuard)
  async linkGoogleIdentityRedirect(@Req() req) {
    return;
  }
}

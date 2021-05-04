import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GRANT } from '../../acl';
import { ACL } from '../../acl/decorators';
import { AuthService } from '../../auth.service';
import { User } from '../../decorators';
import { LoginResponseDto } from '../../dto';
import { JwtGuard } from '../../guards';
import { ReqWithUser } from '../../interfaces';
import { GoogleGuard, GoogleLinkGuard } from './guards';

@ACL(GRANT.ANY)
@ApiTags('Google')
@Controller('google')
export class GoogleController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiOperation({ summary: 'Google login/signup' })
  @UseGuards(GoogleGuard)
  async googleAuth(@Req() req, @Res() res) {
    return;
  }

  @Get('callback')
  @ApiOperation({ summary: 'Google login/signup callback' })
  @UseGuards(GoogleGuard)
  async googleAuthCallback(@Req() req: ReqWithUser): Promise<LoginResponseDto> {
    return await this.authService.thirdPartyLogin(req.user.id, req.user.roles);
  }

  @Get('connect/')
  @ApiOperation({ summary: 'Google link identity' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, GoogleLinkGuard)
  async linkGoogleIdentity(@Req() req, @Res() res) {
    return;
  }

  @Get('connect/callback')
  @ApiOperation({ summary: 'Google link identity callback' })
  @UseGuards(GoogleLinkGuard)
  async linkGoogleIdentityCallback(@Req() req) {
    return;
  }
}

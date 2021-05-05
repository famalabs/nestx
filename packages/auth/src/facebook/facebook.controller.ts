import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ACL } from '../acl/decorators';
import { GRANT } from '../acl/resolvers';
import { AuthService } from '../auth.service';
import { LoginResponseDto } from '../dto';
import { JwtGuard } from '../guards/jwt.guard';
import { ReqWithUser } from '../interfaces';
import { FacebookGuard, FacebookLinkGuard } from './guards';

@ACL(GRANT.ANY)
@ApiTags('Facebook')
@Controller('facebook')
export class FacebookController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiOperation({ summary: 'Facebook login/signup' })
  @UseGuards(FacebookGuard)
  async facebookLogin(@Req() req, @Res() res) {
    return;
  }

  @Get('callback')
  @ApiOperation({ summary: 'Facebook login/signup callback' })
  @UseGuards(FacebookGuard)
  async facebookLoginCallback(@Req() req: ReqWithUser): Promise<LoginResponseDto> {
    return await this.authService.thirdPartyLogin(req.user.id, req.user.roles);
  }

  @Get('connect')
  @ApiOperation({ summary: 'Facebook link identity' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, FacebookLinkGuard)
  async linkFacebookIdentity(@Req() req, @Res() res) {
    return;
  }

  @Get('connect/callback')
  @ApiOperation({ summary: 'Facebook link identity callback' })
  @UseGuards(FacebookLinkGuard)
  async linkFacebookIdentityCallback(@Req() req) {
    return;
  }
}

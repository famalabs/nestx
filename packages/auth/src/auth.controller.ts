import { Body, Controller, Get, Post, Req, UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ACL, GRANT } from './acl';
import { ReqWithUser } from './interfaces';
import { JwtGuard, LoginGuard } from './guards';
import { LoginDto, LoginResponseDto, RefreshTokenDto, SignupDto } from './dto';

@ACL(GRANT.ANY)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LoginGuard)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ type: LoginResponseDto })
  async login(@Body() credentials: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(credentials);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Signup user' })
  async signup(@Body() data: SignupDto): Promise<void> {
    await this.authService.signup(data);
  }

  @Post('token')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ type: LoginResponseDto })
  async token(@Body() data: RefreshTokenDto): Promise<LoginResponseDto> {
    const grantType = data.grantType;
    if (grantType == 'refresh_token') {
      const token = data.refreshToken;
      return await this.authService.refresh(token);
    } else {
      throw new UnprocessableEntityException();
    }
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Logout' })
  async logout(@Req() req: ReqWithUser): Promise<void> {
    return await this.authService.logout(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Me route' })
  @ApiBearerAuth()
  async me(@Req() req: ReqWithUser): Promise<any> {
    return req.user;
  }
}

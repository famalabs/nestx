import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Ip,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiOperation, ApiTags, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GoogleGuard } from './guards/google.guard';
import { FacebookGuard } from './guards/facebook.guard';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-respone.dto';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginGuard } from './guards/login.guard';
import { JwtGuard } from './guards/jwt.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ExtractJwt } from 'passport-jwt';
import { User } from './decorators';
import { NotificationTokenDto, EmailDto } from './dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LoginGuard)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ type: LoginResponseDto })
  async login(@Ip() userIp, @Body() credentials: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(credentials, userIp);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Signup user' })
  async signup(@Body() data: SignupDto, @Req() req): Promise<boolean> {
    await this.authService.signup(data);
    const address = req.protocol + '://' + req.get('host');
    return await this.authService.sendVerificationEmail(data.email, address);
  }

  @Post('email/verify')
  @ApiOperation({ summary: 'Verify email' })
  async verifyEmail(@Body() token: NotificationTokenDto): Promise<boolean> {
    const res = await this.authService.verifyEmail(token.value);
    return res;
  }

  @Post('email/resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  async resendVerificationEmail(@Req() req, @Body() email: EmailDto): Promise<boolean> {
    const address = req.protocol + '://' + req.get('host');
    return await this.authService.resendVerificationEmail(email.value, address);
  }

  @Post('email/forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  async sendForgottenPasswordEmail(@Req() req, @Body() email: EmailDto): Promise<boolean> {
    const address = req.protocol + '://' + req.get('host');
    return await this.authService.sendForgottenPasswordEmail(email.value, address);
  }

  @Post('email/reset-password')
  @ApiOperation({ summary: 'Reset password' })
  async setNewPassord(@Body() resetPwd: ResetPasswordDto): Promise<boolean> {
    return this.authService.resetPassword(resetPwd);
  }

  @Get('token')
  @ApiBearerAuth()
  @ApiQuery({ name: 'refresh_token', required: true })
  @ApiQuery({ name: 'client_id', required: true })
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ type: LoginResponseDto })
  async token(
    @Req() req,
    @Ip() userIp,
    @Query('refresh_token') refreshToken: string,
    @Query('client_id') clientId: string,
  ): Promise<LoginResponseDto> {
    const oldAccessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    return await this.authService.refreshToken(refreshToken, oldAccessToken, clientId, userIp);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'refresh_token', required: true })
  @ApiQuery({ name: 'from_all', required: true, type: Boolean })
  @ApiOperation({ summary: 'Logout' })
  async logout(
    @Req() req,
    @Query('refresh_token') refreshToken: string,
    @Query('from_all') fromAll: string = 'false',
  ): Promise<null> {
    if (fromAll !== 'false' && fromAll !== 'true') {
      throw new BadRequestException('from_all invalid value');
    }
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const flag = fromAll === 'true';
    return await this.authService.logout(req.user['_id'], accessToken, refreshToken, flag);
  }

  @Get('me')
  @ApiOperation({ summary: 'Me route' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  async me(@Req() req): Promise<any> {
    return req.user;
  }

  @Get('google')
  @ApiOperation({ summary: 'Google login/signup' })
  @UseGuards(GoogleGuard)
  async googleAuth(@Req() req, @Res() res) {}

  @Get('google/redirect')
  @ApiOperation({ summary: 'Google login/signup redirect' })
  @UseGuards(GoogleGuard)
  async googleAuthRedirect(@User() user, @Ip() ipAddress): Promise<LoginResponseDto> {
    return await this.authService.thirdPartyLogin(user._id, ipAddress);
  }

  @Get('/facebook')
  @ApiOperation({ summary: 'Facebook login/signup' })
  @UseGuards(FacebookGuard)
  async facebookLogin(@Req() req, @Res() res) {}

  @Get('/facebook/redirect')
  @ApiOperation({ summary: 'Facebook login/signup redirect' })
  @UseGuards(FacebookGuard)
  async facebookLoginCallback(@User() user, @Ip() ipAddress): Promise<LoginResponseDto> {
    return await this.authService.thirdPartyLogin(user._id, ipAddress);
  }

  // @Get('link/google')
  // @ApiOperation({ summary: 'Google link identity' })
  // @UseGuards(JwtGuard,GoogleGuard)
  // async linkGoogleIdentity(@Req() req, @Res() res) {}

  // @Get('link/google/redirect')
  // @ApiOperation({ summary: 'Google link identity redirect' })
  // @UseGuards(JwtGuard,GoogleGuard)
  // async linkGoogleIdentityRedirect(@User() user: IThirdPartyUser) {
  //   return await this.authService.linkIdentity(user);
  // }

  // @Get('link/facebook')
  // @ApiOperation({ summary: 'Facebook link identity' })
  // @UseGuards(JwtGuard,FacebookGuard)
  // async linkFacebookIdentity(@Req() req, @Res() res) {}

  // @Get('link/facebook/redirect')
  // @ApiOperation({ summary: 'Facebook link identity redirect' })
  // @UseGuards(JwtGuard,FacebookGuard)
  // async linkFacebookIdentityCallback(@User() user: IThirdPartyUser) {
  //   return await this.authService.linkIdentity(user);
  // }
}

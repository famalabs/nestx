import { Body, Controller, Get, Ip, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authenticationService: AuthService) {}

  @Post('login')
  @UseGuards(LoginGuard)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ type: LoginResponseDto })
  async login(@Ip() userIp, @Body() credentials: LoginDto): Promise<LoginResponseDto> {
    return await this.authenticationService.login(credentials, userIp);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Signup user' })
  async signup(@Body() data: SignupDto): Promise<any> {
    await this.authenticationService.signup(data);
  }

  @Get('email/verify/:token')
  @ApiOperation({ summary: 'Verify email' })
  async verifyEmail(@Param() params): Promise<any> {
    const res = await this.authenticationService.verifyEmail(params.token);
    if (res) {
      return 'Email verified';
    }
  }

  @Get('email/resend-verification/:email')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiParam({ name: 'email', required: true })
  async resendEmailVerification(@Param() params): Promise<boolean> {
    return await this.authenticationService.resendVerificationEmail(params.email);
  }

  @Get('email/forgot-password/:email')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiParam({ name: 'email', required: true })
  async sendEmailForgotPassword(@Param() params): Promise<boolean> {
    return await this.authenticationService.sendForgottenPasswordEmail(params.email);
  }

  @Post('email/reset-password')
  @ApiOperation({ summary: 'Reset password' })
  async setNewPassord(@Body() resetPwd: ResetPasswordDto): Promise<any> {
    return this.authenticationService.resetPassword(resetPwd);
  }

  @Get('token')
  @ApiBearerAuth()
  @ApiQuery({ name: 'refresh_token', required: false })
  @ApiQuery({ name: 'client_id', required: false })
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ type: LoginResponseDto })
  async token(
    @Req() req,
    @Ip() userIp,
    @Query('refresh_token') refreshToken?: string,
    @Query('client_id') clientId?: string,
  ): Promise<LoginResponseDto> {
    const oldAccessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    return await this.authenticationService.refreshToken(refreshToken, oldAccessToken, clientId, userIp);
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
    @Query('from_all') fromAll: boolean = false,
  ): Promise<any> {
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    return await this.authenticationService.logout(req.user['_id'], accessToken, refreshToken, fromAll);
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
  googleAuthRedirect(@Req() req) {
    this.authenticationService.socialAccess(req);
  }

  @Get('/facebook')
  @ApiOperation({ summary: 'Facebook login/signup' })
  @UseGuards(FacebookGuard)
  facebookLogin(@Req() req, @Res() res) {}

  @Get('/facebook/redirect')
  @ApiOperation({ summary: 'Facebook login/signup redirect' })
  @UseGuards(FacebookGuard)
  facebookLoginCallback(@Req() req) {
    this.authenticationService.socialAccess(req);
  }
}

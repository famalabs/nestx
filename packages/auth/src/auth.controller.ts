import { BadRequestException, Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { GoogleGuard } from './guards/google.guard';
import { FacebookGuard } from './guards/facebook.guard';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-respone.dto';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginGuard } from './guards/login.guard';
import { JwtGuard } from './guards/jwt.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ACL, User } from './decorators';
import { NotificationTokenDto, EmailDto } from './dto';
import { GoogleLinkGuard } from './guards/google-link.guard';
import { FacebookLinkGuard } from './guards/facebook-link.guard';
import { GRANT } from './acl';

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
  async signup(@Body() data: SignupDto): Promise<boolean> {
    await this.authService.signup(data);
    return await this.authService.sendVerificationEmail(data.email);
  }

  @Post('email/verify')
  @ApiOperation({ summary: 'Verify email' })
  async verifyEmail(@Body() token: NotificationTokenDto): Promise<boolean> {
    const res = await this.authService.verifyEmail(token.value);
    return res;
  }

  @Post('email/resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  async resendVerificationEmail(@Body() email: EmailDto): Promise<boolean> {
    return await this.authService.resendVerificationEmail(email.value);
  }

  @Post('email/forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  async sendForgottenPasswordEmail(@Body() email: EmailDto): Promise<boolean> {
    return await this.authService.sendForgottenPasswordEmail(email.value);
  }

  @Post('email/reset-password')
  @ApiOperation({ summary: 'Reset password' })
  async setNewPassord(@Body() resetPwd: ResetPasswordDto): Promise<boolean> {
    return this.authService.resetPassword(resetPwd);
  }

  @Get('token')
  @ApiBearerAuth()
  @ApiQuery({ name: 'refresh_token', required: true })
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ type: LoginResponseDto })
  async token(@Req() req, @Query('refresh_token') refreshToken: string): Promise<LoginResponseDto> {
    const oldAccessToken = this.authService.tokenFromRequestExtractor(req);
    return await this.authService.refreshToken(refreshToken, oldAccessToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiQuery({ name: 'refresh_token', required: true })
  @ApiQuery({ name: 'from_all', required: true, type: Boolean })
  @ApiOperation({ summary: 'Logout' })
  async logout(
    @Req() req,
    @Query('refresh_token') refreshToken: string,
    @Query('from_all') fromAll = 'false',
  ): Promise<null> {
    if (fromAll !== 'false' && fromAll !== 'true') {
      throw new BadRequestException('from_all invalid value');
    }
    const accessToken = this.authService.tokenFromRequestExtractor(req);
    const flag = fromAll === 'true';
    return await this.authService.logout(req.user['id'], accessToken, refreshToken, flag);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Me route' })
  @ApiBearerAuth()
  async me(@Req() req): Promise<any> {
    return req.user;
  }

  @Get('google')
  @ApiOperation({ summary: 'Google login/signup' })
  @UseGuards(GoogleGuard)
  async googleAuth(@Req() req, @Res() res) {
    return;
  }

  @Get('google/redirect')
  @ApiOperation({ summary: 'Google login/signup redirect' })
  @UseGuards(GoogleGuard)
  async googleAuthRedirect(@User() user): Promise<LoginResponseDto> {
    return await this.authService.thirdPartyLogin(user.id, user.roles);
  }

  @Get('facebook')
  @ApiOperation({ summary: 'Facebook login/signup' })
  @UseGuards(FacebookGuard)
  async facebookLogin(@Req() req, @Res() res) {
    return;
  }

  @Get('facebook/redirect')
  @ApiOperation({ summary: 'Facebook login/signup redirect' })
  @UseGuards(FacebookGuard)
  async facebookLoginCallback(@User() user): Promise<LoginResponseDto> {
    return await this.authService.thirdPartyLogin(user.id, user.roles);
  }

  @Get('connect/google')
  @ApiOperation({ summary: 'Google link identity' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, GoogleLinkGuard)
  async linkGoogleIdentity(@Req() req, @Res() res) {
    return;
  }

  @Get('connect/google/redirect')
  @ApiOperation({ summary: 'Google link identity redirect' })
  @UseGuards(GoogleLinkGuard)
  async linkGoogleIdentityRedirect(@Req() req) {
    return;
  }

  @Get('connect/facebook')
  @ApiOperation({ summary: 'Facebook link identity' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, FacebookLinkGuard)
  async linkFacebookIdentity(@Req() req, @Res() res) {
    return;
  }

  @Get('connect/facebook/redirect')
  @ApiOperation({ summary: 'Facebook link identity redirect' })
  @UseGuards(FacebookLinkGuard)
  async linkFacebookIdentityCallback(@Req() req) {
    return;
  }
}

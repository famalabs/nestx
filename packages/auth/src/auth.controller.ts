import { Body, Controller, Get, Post, UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-respone.dto';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginGuard } from './guards/login.guard';
import { JwtGuard } from './guards/jwt.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from './decorators';
import { NotificationTokenDto, EmailDto, RefreshTokenDto } from './dto';
import { ACL, GRANT } from './acl';

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
  async logout(@User() user): Promise<void> {
    return await this.authService.logout(user.id);
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

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Me route' })
  @ApiBearerAuth()
  async me(@User() user): Promise<any> {
    return user;
  }
}

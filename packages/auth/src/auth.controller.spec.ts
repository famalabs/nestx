import * as mocks from 'node-mocks-http';
import { CanActivate } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './dto/user';
import { LoginGuard } from './guards/login.guard';
import { LoginResponseDto } from './dto/login-respone.dto';
import { LoginDto } from './dto';
import { SignupDto } from './dto/signup.dto';
import { JwtGuard } from './guards/jwt.guard';
import { GoogleGuard } from './guards/google.guard';
import { FacebookGuard } from './guards/facebook.guard';
import { IEmailVerification } from './interfaces/email-verification.interface';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { IForgottenPassword } from './interfaces/forgotten-password.interface';

const date = new Date();
const dateNowUtc = date.getMilliseconds();
const user: User = {
  email: 'user@email.com',
  password: 'myPassword',
  roles: [],
  isSocial: false,
  isValid: true,
  socialProvider: 'local',
  createdAt: date,
  updatedAt: date,
  _id: '1',
};
const userIp = '127.0.0.1';
const login: LoginDto = {
  email: user.email,
  password: user.password,
  clientId: 'string',
};
const loginResponse: LoginResponseDto = {
  accessToken: 'accessJwtToken',
  expiresIn: '900',
  refreshToken: 'refreshToken',
};
const signup: SignupDto = {
  email: user.email,
  password: user.password,
};
const req = mocks.createRequest();
req.res = mocks.createResponse();
req.headers.authorization = `Bearer ${loginResponse.accessToken}`;
const loginResponseAfterRefresh: LoginResponseDto = {
  accessToken: 'newAccessJwtToken',
  tokenType: 'Bearer',
  expiresIn: '900',
  refreshToken: 'newRefreshToken',
};
req.user = { _id: user._id };

const emailVerification: IEmailVerification = {
  email: user.email,
  emailToken: '1234567',
  timestamp: date,
};
req.params = { token: emailVerification.emailToken, email: emailVerification.email };
const newPasswordRecord: IForgottenPassword = {
  email: user.email,
  newPasswordToken: '1234567',
  timestamp: date,
};
const resetPwd: ResetPasswordDto = {
  newPassword: 'newPassword',
  token: newPasswordRecord.newPasswordToken,
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const mockLoginGuard: CanActivate = { canActivate: jest.fn(() => true) };
    const mockJwtGuard: CanActivate = { canActivate: jest.fn(() => true) };
    const mockGoogleGuard: CanActivate = { canActivate: jest.fn(() => true) };
    const mockFacebookGuard: CanActivate = { canActivate: jest.fn(() => true) };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(loginResponse),
            signup: jest.fn().mockResolvedValue(null),
            refreshToken: jest.fn().mockResolvedValue(loginResponseAfterRefresh),
            logout: jest.fn().mockResolvedValue(null),
            verifyEmail: jest.fn().mockResolvedValue(true),
            resendVerificationEmail: jest.fn().mockImplementation((email: string) => Promise.resolve(true)),
            sendForgottenPasswordEmail: jest.fn().mockImplementation((email: string) => Promise.resolve(true)),
            resetPassword: jest.fn().mockResolvedValue(true),
            socialAccess: jest.fn().mockResolvedValue(loginResponse),
          },
        },
      ],
    })
      .overrideGuard(LoginGuard)
      .useValue(mockLoginGuard)
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .overrideGuard(GoogleGuard)
      .useValue(mockGoogleGuard)
      .overrideGuard(FacebookGuard)
      .useValue(mockFacebookGuard)
      .compile();

    controller = app.get<AuthController>(AuthController);
    service = app.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login user', () => {
      expect(controller.login(userIp, login)).resolves.toEqual(loginResponse);
    });
  });
  describe('signup', () => {
    it('should signup user', () => {
      expect(controller.signup(signup)).resolves.toEqual(null);
    });
  });
  describe('token', () => {
    it('should get a new access Token and Refresh Token', () => {
      expect(controller.token(req, userIp, loginResponse.refreshToken, login.clientId)).resolves.toEqual(
        loginResponseAfterRefresh,
      );
    });
  });
  describe('logout', () => {
    it('should logout user', () => {
      expect(controller.logout(req, loginResponse.refreshToken)).resolves.toEqual(null);
    });
  });
  describe('me', () => {
    it('should return currently logged user', () => {
      expect(controller.me(req)).resolves.toEqual({ _id: user._id });
    });
  });
  describe('email/verify/:token', () => {
    it('should verify email', async () => {
      const spy = jest.spyOn(service, 'verifyEmail').mockResolvedValueOnce(true);
      const getResponse = await controller.verifyEmail(req.params);
      expect(getResponse).toEqual(true);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(req.params['token']);
    });
    it('should not verify email', async () => {
      const spy = jest.spyOn(service, 'verifyEmail').mockResolvedValueOnce(false);
      const getResponse = await controller.verifyEmail(req.params);
      expect(getResponse).toEqual(false);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(req.params['token']);
    });
  });
  describe('email/resend-verification/:email', () => {
    it('should resend verification email', async () => {
      const spy = jest.spyOn(service, 'resendVerificationEmail').mockResolvedValueOnce(true);
      const getResponse = await controller.resendVerificationEmail(req.params);
      expect(getResponse).toEqual(true);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(req.params['email']);
    });
  });
  describe('email/forgot-password/:email', () => {
    it('should send forgotten password email', async () => {
      const spy = jest.spyOn(service, 'sendForgottenPasswordEmail').mockResolvedValueOnce(true);
      const getResponse = await controller.sendForgottenPasswordEmail(req.params);
      expect(getResponse).toEqual(true);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(req.params['email']);
    });
  });
});

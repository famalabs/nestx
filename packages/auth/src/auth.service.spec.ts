import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ReturnModelType, DocumentType, getModelForClass } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';
import { AuthService } from './auth.service';
import { ForgottenPassword } from './models';
import { TokenService } from './token/token.service';
import { EmailService } from './email/email.service';
import { IUsersService } from './interfaces/users-service.interface';
import { AUTH_OPTIONS, EMAIL_ERRORS, LOGIN_ERRORS, RESET_PASSWORD_ERRORS } from './constants';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IAccessToken, IAuthenticationModuleOptions, IJwtPayload, IRefreshToken } from './interfaces';
import { USER_ROLES } from './ACLs';
import { Document } from 'mongoose';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto, LoginResponseDto, SignupDto } from './dto';
import * as mocks from 'node-mocks-http';

interface ForgottenPasswordDoc extends Document {
  email: string;
  newPasswordToken: string;
  timestamp: Date;
}
const mockForgottenPasswordDoc: Partial<ForgottenPasswordDoc> = {
  email: 'user@email.com',
  newPasswordToken: '1234567',
  timestamp: new Date(),
};
const addMinutes = function (dt, minutes) {
  return new Date(dt.getTime() + minutes * 60000);
};
const mockOldForgottenPasswordDoc: Partial<ForgottenPasswordDoc> = {
  email: 'user@email.com',
  newPasswordToken: '1234567',
  timestamp: addMinutes(new Date(), -16),
};
const resetPwd: ResetPasswordDto = {
  newPassword: 'newPassword',
  token: mockForgottenPasswordDoc.newPasswordToken,
};
const resetPwdExpToken: ResetPasswordDto = {
  newPassword: 'newPassword',
  token: mockOldForgottenPasswordDoc.newPasswordToken,
};

interface UserDoc extends Document {
  email: string;
  password: string;
  roles: USER_ROLES[];
  isSocial: boolean;
  isValid: boolean;
  socialProvider: string;
  createdAt?: Date;
  updatedAt?: Date;
  _id: string;
}
const userLocal: Partial<UserDoc> = {
  email: 'user@email.com',
  password: 'myPassword',
  roles: [],
  isSocial: false,
  isValid: true,
  socialProvider: 'local',
  createdAt: new Date(),
  updatedAt: new Date(),
  _id: '111111',
};
const userLocalNotValid: Partial<UserDoc> = {
  email: 'user@email.com',
  password: 'myPassword',
  roles: [],
  isSocial: false,
  isValid: false,
  socialProvider: 'local',
  createdAt: new Date(),
  updatedAt: new Date(),
  _id: '00000000',
};
const userGoogle: Partial<UserDoc> = {
  email: 'user@email.com',
  password: 'myPassword',
  roles: [],
  isSocial: true,
  isValid: true,
  socialProvider: 'local',
  createdAt: new Date(),
  updatedAt: new Date(),
  _id: '2222222',
};
const userFb: Partial<UserDoc> = {
  email: 'user@email.com',
  password: 'myPassword',
  roles: [],
  isSocial: true,
  isValid: true,
  socialProvider: 'local',
  createdAt: new Date(),
  updatedAt: new Date(),
  _id: '3333333',
};

interface VerificationEmailDoc extends Document {
  email: string;
  emailToken: string;
  timestamp: Date;
}
const mockVerificationEmailDoc: Partial<VerificationEmailDoc> = {
  email: 'user@email.com',
  emailToken: '1234567',
  timestamp: new Date(),
};
const mockOldVerificationEmailDoc: Partial<VerificationEmailDoc> = {
  email: 'user@email.com',
  emailToken: '1234567',
  timestamp: addMinutes(new Date(), -16),
};

const userIp = '127.0.0.1';
const userLocalLogin: LoginDto = {
  email: userLocal.email,
  password: userLocal.password,
  clientId: 'string',
};
const userLocalPayload: IJwtPayload = {
  sub: userLocal._id,
};

const userLocalAccessToken: IAccessToken = {
  accessToken: 'accessToken',
  expiresIn: '900',
  tokenType: 'Bearer',
};
const userLocalTokenContent = {
  userId: userLocal._id,
  clientId: userLocalLogin.clientId,
  ipAddress: userIp,
};
const userLocalRefreshToken: IRefreshToken = {
  value: 'refreshToken',
  userId: userLocal._id,
  expiresAt: new Date(),
  clientId: userLocalLogin.clientId,
  ipAddress: userIp,
};
const loginResponse: LoginResponseDto = {
  accessToken: 'accessToken',
  expiresIn: '900',
  refreshToken: 'refreshToken',
  tokenType: 'Bearer',
};
const signup: SignupDto = {
  email: userLocal.email,
  password: userLocal.password,
};
const req = mocks.createRequest();
req.res = mocks.createResponse();
req.ip = userIp;
req.user = { _id: userGoogle._id };
const userGooglePayload: IJwtPayload = {
  sub: userGoogle._id,
};
const userGoogleTokenContent = {
  userId: userGoogle._id,
  clientId: '',
  ipAddress: userIp,
};
describe('AuthService', () => {
  let service: AuthService;
  let tokenService: TokenService;
  let emailService: EmailService;
  let usersService: IUsersService;
  let options: IAuthenticationModuleOptions;
  let model: ReturnModelType<AnyParamConstructor<ForgottenPassword>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(ForgottenPassword.name),
          // notice that only the functions we call from the model are mocked
          useValue: {
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            deleteOne: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: TokenService,
          useValue: {
            createAccessToken: jest.fn(),
            createRefreshToken: jest.fn(),
            revokeToken: jest.fn(),
            getAccessTokenFromRefreshToken: jest.fn(),
            deleteRefreshToken: jest.fn(),
            deleteAllRefreshTokenForUser: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
        {
          provide: IUsersService,
          useValue: {
            validateUser: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            setPassword: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: AUTH_OPTIONS,
          useValue: {
            constants: {
              mail: {
                auth: {
                  user: 'user@email.com',
                },
              },
              system: {
                host: 'http://localhost',
                port: '3000',
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    emailService = module.get<EmailService>(EmailService);
    tokenService = module.get<TokenService>(TokenService);
    usersService = module.get<IUsersService>(IUsersService);
    options = module.get<IAuthenticationModuleOptions>(AUTH_OPTIONS);
    model = module.get<ReturnModelType<AnyParamConstructor<ForgottenPassword>>>(getModelToken(ForgottenPassword.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(emailService).toBeDefined();
    expect(tokenService).toBeDefined();
    expect(usersService).toBeDefined();
    expect(options).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('resetPassword', () => {
    it('should reset password from token', async () => {
      const doc = mockForgottenPasswordDoc;
      const spyOnModel = jest.spyOn(model, 'findOne').mockResolvedValue(doc as any);
      const spyOnUsersService = jest.spyOn(usersService, 'setPassword');
      const getResponse = await service.resetPassword(resetPwd);
      expect(getResponse).toEqual(true);
      expect(spyOnModel).toHaveBeenCalledWith({ newPasswordToken: resetPwd.token });
      expect(spyOnUsersService).toHaveBeenCalledWith(doc.email, resetPwd.newPassword);
    });
    it('should not reset password from token that not exists', async () => {
      const spy = jest.spyOn(model, 'findOne').mockResolvedValue(null);
      await expect(() => service.resetPassword(resetPwd)).rejects.toThrow(UnauthorizedException);
      await expect(() => service.resetPassword(resetPwd)).rejects.toThrow(RESET_PASSWORD_ERRORS.WRONG_TOKEN);
      expect(spy).toHaveBeenCalledWith({ newPasswordToken: resetPwd.token });
    });
    it('should not reset password from expired token', async () => {
      const doc = mockOldForgottenPasswordDoc;
      const spy = jest.spyOn(model, 'findOne').mockResolvedValue(doc as any);
      await expect(() => service.resetPassword(resetPwdExpToken)).rejects.toThrow(UnauthorizedException);
      await expect(() => service.resetPassword(resetPwdExpToken)).rejects.toThrow(RESET_PASSWORD_ERRORS.TOKEN_EXPIRED);
      expect(spy).toHaveBeenCalledWith({ newPasswordToken: resetPwdExpToken.token });
    });
  });

  describe('sendForgottenPasswordEmail', () => {
    it('should send forgotten password email', async () => {
      const spyOnUsersService = jest.spyOn(usersService, 'findOne').mockResolvedValue(userLocal as any);
      const spyOnModelFind = jest.spyOn(model, 'findOne').mockResolvedValue(mockOldForgottenPasswordDoc as any);
      const spyOnModelFindAndUpdate = jest
        .spyOn(model, 'findOneAndUpdate')
        .mockResolvedValue(mockForgottenPasswordDoc as any);
      const spyOnEmailService = jest.spyOn(emailService, 'sendEmail').mockResolvedValue(true);
      const getResponse = await service.sendForgottenPasswordEmail(userLocal.email);
      expect(spyOnUsersService).toHaveBeenCalledWith({ email: userLocal.email });
      expect(spyOnModelFind).toHaveBeenCalledWith({ email: userLocal.email });
      expect(getResponse).toEqual(true);
    });
    it('should not send forgotten password email to not registered user', async () => {
      const spy = jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
      await expect(() => service.sendForgottenPasswordEmail(userLocal.email)).rejects.toThrow(NotFoundException);
      await expect(() => service.sendForgottenPasswordEmail(userLocal.email)).rejects.toThrow(
        LOGIN_ERRORS.USER_NOT_FOUND,
      );
      expect(spy).toHaveBeenCalledWith({ email: userLocal.email });
    });
    it('should not send forgotten password email when error during send', async () => {
      const spyOnUsersService = jest.spyOn(usersService, 'findOne').mockResolvedValue(userLocal as any);
      const spyOnModelFind = jest.spyOn(model, 'findOne').mockResolvedValue(mockOldForgottenPasswordDoc as any);
      const spyOnModelFindAndUpdate = jest
        .spyOn(model, 'findOneAndUpdate')
        .mockResolvedValue(mockForgottenPasswordDoc as any);
      const spyOnEmailService = jest.spyOn(emailService, 'sendEmail').mockResolvedValue(false);
      await expect(() => service.sendForgottenPasswordEmail(userLocal.email)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(() => service.sendForgottenPasswordEmail(userLocal.email)).rejects.toThrow(
        EMAIL_ERRORS.EMAIL_NOT_SENT,
      );
      expect(spyOnUsersService).toHaveBeenCalledWith({ email: userLocal.email });
      expect(spyOnModelFind).toHaveBeenCalledWith({ email: userLocal.email });
    });
    it('should not send forgotten password email when recently sent', async () => {
      const spyOnUsersService = jest.spyOn(usersService, 'findOne').mockResolvedValue(userLocal as any);
      const spyOnModelFind = jest.spyOn(model, 'findOne').mockResolvedValue(mockForgottenPasswordDoc as any);
      await expect(() => service.sendForgottenPasswordEmail(userLocal.email)).rejects.toThrow(ConflictException);
      await expect(() => service.sendForgottenPasswordEmail(userLocal.email)).rejects.toThrow(
        EMAIL_ERRORS.EMAIL_SENT_RECENTLY,
      );
      expect(spyOnUsersService).toHaveBeenCalledWith({ email: userLocal.email });
      expect(spyOnModelFind).toHaveBeenCalledWith({ email: userLocal.email });
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email', async () => {
      const spyOnEmailServiceFind = jest
        .spyOn(emailService, 'findOne')
        .mockResolvedValue(mockOldVerificationEmailDoc as any);
      const spyOnModelFindAndUpdate = jest
        .spyOn(emailService, 'findOneAndUpdate')
        .mockResolvedValue(mockVerificationEmailDoc as any);
      const spyOnEmailServiceSend = jest.spyOn(emailService, 'sendEmail').mockResolvedValue(true);
      const getResponse = await service.sendVerificationEmail(userLocal.email);
      expect(spyOnEmailServiceFind).toHaveBeenCalledWith({ email: userLocal.email });
      expect(getResponse).toEqual(true);
    });
    it('should not send verification email to not registered user', async () => {
      const spy = jest.spyOn(emailService, 'findOne').mockResolvedValue(null);
      await expect(() => service.sendVerificationEmail(userLocal.email)).rejects.toThrow(NotFoundException);
      await expect(() => service.sendVerificationEmail(userLocal.email)).rejects.toThrow(EMAIL_ERRORS.USER_NOT_FOUND);
      expect(spy).toHaveBeenCalledWith({ email: userLocal.email });
    });
    it('should not send verification email when error during send', async () => {
      const spyOnEmailServiceFind = jest
        .spyOn(emailService, 'findOne')
        .mockResolvedValue(mockOldVerificationEmailDoc as any);
      const spyOnModelFindAndUpdate = jest
        .spyOn(emailService, 'findOneAndUpdate')
        .mockResolvedValue(mockVerificationEmailDoc as any);
      const spyOnEmailServiceSend = jest.spyOn(emailService, 'sendEmail').mockResolvedValue(false);

      await expect(() => service.sendVerificationEmail(userLocal.email)).rejects.toThrow(InternalServerErrorException);
      await expect(() => service.sendVerificationEmail(userLocal.email)).rejects.toThrow(EMAIL_ERRORS.EMAIL_NOT_SENT);
      expect(spyOnEmailServiceFind).toHaveBeenCalledWith({ email: userLocal.email });
    });
    it('should not send verification email when recently sent', async () => {
      const spyOnEmailServiceFind = jest
        .spyOn(emailService, 'findOne')
        .mockResolvedValue(mockVerificationEmailDoc as any);
      await expect(() => service.sendVerificationEmail(userLocal.email)).rejects.toThrow(ConflictException);
      await expect(() => service.sendVerificationEmail(userLocal.email)).rejects.toThrow(
        EMAIL_ERRORS.EMAIL_SENT_RECENTLY,
      );
      expect(spyOnEmailServiceFind).toHaveBeenCalledWith({ email: userLocal.email });
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email', async () => {
      const spyOnEmailServiceFind = jest
        .spyOn(emailService, 'findOne')
        .mockResolvedValue(mockVerificationEmailDoc as any);
      const spyOnService = jest.spyOn(service, 'sendVerificationEmail').mockResolvedValue(Promise.resolve(true));
      const getResponse = await service.resendVerificationEmail(userLocal.email);
      expect(spyOnEmailServiceFind).toHaveBeenCalledWith({ email: userLocal.email });
      expect(spyOnService).toHaveBeenCalledWith(mockVerificationEmailDoc.email);
      expect(getResponse).toEqual(true);
    });
    it('should not resend verification email to not previously registered user', async () => {
      const spyOnEmailServiceFind = jest.spyOn(emailService, 'findOne').mockResolvedValue(null);
      await expect(() => service.resendVerificationEmail(userLocal.email)).rejects.toThrow(NotFoundException);
      await expect(() => service.resendVerificationEmail(userLocal.email)).rejects.toThrow(EMAIL_ERRORS.USER_NOT_FOUND);
      expect(spyOnEmailServiceFind).toHaveBeenCalledWith({ email: userLocal.email });
    });
    it('should not resend verification email when error during send', async () => {
      const spyOnEmailServiceFind = jest
        .spyOn(emailService, 'findOne')
        .mockResolvedValue(mockVerificationEmailDoc as any);
      const spyOnService = jest.spyOn(service, 'sendVerificationEmail').mockResolvedValue(Promise.resolve(false));
      await expect(() => service.resendVerificationEmail(userLocal.email)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(() => service.resendVerificationEmail(userLocal.email)).rejects.toThrow(EMAIL_ERRORS.EMAIL_NOT_SENT);
      expect(spyOnEmailServiceFind).toHaveBeenCalledWith({ email: userLocal.email });
      expect(spyOnService).toHaveBeenCalledWith(mockVerificationEmailDoc.email);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const spyOnEmailService = jest.spyOn(emailService, 'findOne').mockResolvedValue(mockVerificationEmailDoc as any);
      const spyOnUserService = jest.spyOn(usersService, 'findOne').mockResolvedValue(userLocal as any);
      jest.spyOn(usersService, 'update').mockResolvedValue(userLocal as any);
      jest.spyOn(emailService, 'delete').mockResolvedValue(null);
      const getResponse = await service.verifyEmail(mockVerificationEmailDoc.emailToken);
      expect(getResponse).toEqual(true);
    });
    it('should not verify email with wrong code', async () => {
      const spyOnEmailService = jest.spyOn(emailService, 'findOne').mockResolvedValue(null);
      await expect(() => service.verifyEmail(mockVerificationEmailDoc.emailToken)).rejects.toThrow(NotFoundException);
      await expect(() => service.verifyEmail(mockVerificationEmailDoc.emailToken)).rejects.toThrow(
        EMAIL_ERRORS.EMAIL_WRONG_VERIFY_CODE,
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh Token', async () => {
      jest.spyOn(tokenService, 'getAccessTokenFromRefreshToken').mockResolvedValue(loginResponse);
      expect(service.refreshToken('refreshToken', 'oldAccessToken', 'string', '127.0.0.1')).resolves.toEqual(
        loginResponse,
      );
    });
  });

  describe('logout', () => {
    it('should logout from one', async () => {
      const spyOnRevokeToken = jest.spyOn(tokenService, 'revokeToken').mockResolvedValue(null);
      const spyOnDelete = jest.spyOn(tokenService, 'deleteRefreshToken').mockResolvedValue(null);
      const getResponse = await service.logout(userLocal._id, 'accessToken', 'refreshToken', false);
      expect(spyOnRevokeToken).toHaveBeenCalledWith('accessToken', userLocal._id);
      expect(spyOnDelete).toHaveBeenCalledWith('refreshToken');
      expect(getResponse).toEqual(null);
    });
    it('should logout from all', async () => {
      const spyOnRevokeToken = jest.spyOn(tokenService, 'revokeToken').mockResolvedValue(null);
      const spyOnDelete = jest.spyOn(tokenService, 'deleteAllRefreshTokenForUser').mockResolvedValue(null);
      const getResponse = await service.logout(userLocal._id, 'accessToken', 'refreshToken', true);
      expect(spyOnRevokeToken).toHaveBeenCalledWith('accessToken', userLocal._id);
      expect(spyOnDelete).toHaveBeenCalledWith(userLocal._id);
      expect(getResponse).toEqual(null);
    });
  });

  describe('signup', () => {
    it('should signup user', async () => {
      const onSpyUsersService = jest.spyOn(usersService, 'create').mockResolvedValue(userLocalNotValid as any);
      const onSpySendVerEmail = jest.spyOn(service, 'sendVerificationEmail').mockResolvedValue(true);
      const getResponse = await service.signup(signup);
      expect(onSpyUsersService).toHaveBeenCalledWith(signup);
      expect(onSpySendVerEmail).toHaveBeenCalledWith(signup.email);
      expect(getResponse).toEqual(userLocalNotValid);
    });
    it('should not signup user with error on sending email', async () => {
      const onSpyUsersService = jest.spyOn(usersService, 'create').mockResolvedValue(userLocalNotValid as any);
      const onSpySendVerEmail = jest.spyOn(service, 'sendVerificationEmail').mockResolvedValue(false);
      await expect(() => service.signup(signup)).rejects.toThrow(InternalServerErrorException);
      await expect(() => service.signup(signup)).rejects.toThrow(EMAIL_ERRORS.EMAIL_NOT_SENT);
      expect(onSpyUsersService).toHaveBeenCalledWith(signup);
      expect(onSpySendVerEmail).toHaveBeenCalledWith(signup.email);
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const onSpyUsersService = jest.spyOn(usersService, 'validateUser').mockResolvedValue(userLocal as any);
      const onCreateAccessToken = jest.spyOn(tokenService, 'createAccessToken').mockResolvedValue(userLocalAccessToken);
      const onCreateRefreshToken = jest
        .spyOn(tokenService, 'createRefreshToken')
        .mockResolvedValue(userLocalRefreshToken);

      const getResponse = await service.login(userLocalLogin, userIp);
      expect(onSpyUsersService).toHaveBeenCalledWith(userLocalLogin.email, userLocalLogin.password);
      expect(onCreateAccessToken).toHaveBeenCalledWith(userLocalPayload);
      expect(onCreateRefreshToken).toHaveBeenCalledWith(userLocalTokenContent);
      expect(getResponse).toEqual(loginResponse);
    });
    it('should not login user with wrong credentials', async () => {
      const onSpyUsersService = jest.spyOn(usersService, 'validateUser').mockResolvedValue(null);
      await expect(() => service.login(userLocalLogin, userIp)).rejects.toThrow(NotFoundException);
      await expect(() => service.login(userLocalLogin, userIp)).rejects.toThrow(LOGIN_ERRORS.USER_NOT_FOUND);
      expect(onSpyUsersService).toHaveBeenCalledWith(userLocalLogin.email, userLocalLogin.password);
    });
    it('should not login not verified user', async () => {
      const onSpyUsersService = jest.spyOn(usersService, 'validateUser').mockResolvedValue(userLocalNotValid as any);
      await expect(() => service.login(userLocalLogin, userIp)).rejects.toThrow(UnauthorizedException);
      await expect(() => service.login(userLocalLogin, userIp)).rejects.toThrow(LOGIN_ERRORS.USER_NOT_VERIFIED);
      expect(onSpyUsersService).toHaveBeenCalledWith(userLocalLogin.email, userLocalLogin.password);
    });
    it('should not login social user with email/pwd credentials', async () => {
      const onSpyUsersService = jest.spyOn(usersService, 'validateUser').mockResolvedValue(userGoogle as any);
      await expect(() => service.login(userLocalLogin, userIp)).rejects.toThrow(UnauthorizedException);
      await expect(() => service.login(userLocalLogin, userIp)).rejects.toThrow(LOGIN_ERRORS.USER_SOCIAL);
      expect(onSpyUsersService).toHaveBeenCalledWith(userLocalLogin.email, userLocalLogin.password);
    });
  });

  describe('socialAccess', () => {
    it('should login social user', async () => {
      const onCreateAccessToken = jest.spyOn(tokenService, 'createAccessToken').mockResolvedValue(userLocalAccessToken);
      const onCreateRefreshToken = jest
        .spyOn(tokenService, 'createRefreshToken')
        .mockResolvedValue(userLocalRefreshToken);

      const getResponse = await service.socialAccess(req);
      expect(onCreateAccessToken).toHaveBeenCalledWith(userGooglePayload);
      expect(onCreateRefreshToken).toHaveBeenCalledWith(userGoogleTokenContent);
      expect(getResponse).toEqual(loginResponse);
    });
  });
});

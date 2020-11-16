import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';
import { AUTH_OPTIONS, EMAIL_ERRORS, LOGIN_ERRORS, RESET_PASSWORD_ERRORS } from './constants';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IAccessToken,
  IAuthenticationModuleOptions,
  IEmailNotification,
  IJwtPayload,
  INotificationSender,
  IRefreshToken,
  IUsersService,
  NOTIFICATION_CATEGORY,
} from './interfaces';
import { USER_ROLES } from './ACLs';
import { Document } from 'mongoose';
import { LoginDto, LoginResponseDto, ResetPasswordDto, SignupDto, User } from './dto';
import * as mocks from 'node-mocks-http';
import { EmailNotification } from './models';
import { UserIdentityService } from './user-identity.service';
import { EmailNotificationService } from './notification';

const addMinutes = function (dt, minutes) {
  return new Date(dt.getTime() + minutes * 60000);
};
const date = new Date();
const oldDate = addMinutes(date, -16);
interface UserDoc extends Document {
  email: string;
  password: string;
  roles: USER_ROLES[];
  isVerified: boolean;
  socialProvider: string;
  createdAt?: Date;
  updatedAt?: Date;
  _id: string;
}
const userLocal: Partial<UserDoc> = {
  email: 'user@email.com',
  password: 'myPassword',
  roles: [],
  isVerified: true,
  socialProvider: 'local',
  createdAt: date,
  updatedAt: date,
  _id: '111111',
};
const userLocalNotVerified: Partial<UserDoc> = {
  email: 'user@email.com',
  password: 'myPassword',
  roles: [],
  isVerified: false,
  socialProvider: 'local',
  createdAt: date,
  updatedAt: date,
  _id: '00000000',
};
const userGoogle: Partial<UserDoc> = {
  email: 'user@email.com',
  password: 'myPassword',
  roles: [],
  isVerified: true,
  socialProvider: 'local',
  createdAt: date,
  updatedAt: date,
  _id: '2222222',
};

const mockForgottenPasswordDoc: Partial<EmailNotification> = {
  _id: '1',
  to: 'user@email.com',
  token: '1234567',
  category: NOTIFICATION_CATEGORY.RESET_CREDENTIALS,
  createdAt: date,
  updatedAt: date,
};
const mockOldForgottenPasswordDoc: Partial<EmailNotification> = {
  _id: '2',
  to: 'user@email.com',
  token: '1234567',
  category: NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION,
  createdAt: oldDate,
  updatedAt: oldDate,
};
const mockVerificationEmailDoc: Partial<EmailNotification> = {
  _id: '3',
  to: 'user@email.com',
  token: '1234567',
  category: NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION,
  createdAt: date,
  updatedAt: date,
};
const mockOldVerificationEmailDoc: Partial<EmailNotification> = {
  _id: '4',
  to: 'user@email.com',
  token: '1234567',
  category: NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION,
  createdAt: oldDate,
  updatedAt: date,
};
const resetPwd: ResetPasswordDto = {
  newPassword: 'newPassword',
  token: mockForgottenPasswordDoc.token,
};
const resetPwdExpToken: ResetPasswordDto = {
  newPassword: 'newPassword',
  token: mockOldForgottenPasswordDoc.token,
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
  expiresAt: date,
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
const address = 'http://localhost:3000';

@Injectable()
export class MockSender implements INotificationSender {
  notify(to: string): Promise<boolean>;
  notify(to: string, options: any): Promise<boolean>;
  notify(to: string, options: any, template: string): Promise<boolean>;
  async notify(to: any, options?: any, template?: any) {
    return true;
  }
}

describe('AuthService', () => {
  let service: AuthService;
  let tokenService: TokenService;
  let emailNotificationService: EmailNotificationService;
  let usersService: IUsersService;
  let sender: INotificationSender;
  let options: IAuthenticationModuleOptions;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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
          provide: EmailNotificationService,
          useValue: {
            notify: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            deleteById: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
        {
          provide: UserIdentityService,
          useValue: {},
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
          provide: INotificationSender,
          useClass: MockSender,
        },
        {
          provide: AUTH_OPTIONS,
          useValue: {
            constants: {
              blockNotVerifiedUser: true,
              mail: {
                auth: {
                  user: 'user@email.com',
                },
                links: {
                  emailVerification: 'http://localhost:3000',
                  forgotPassword: 'http://localhost:3000',
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
    emailNotificationService = module.get<EmailNotificationService>(EmailNotificationService);
    tokenService = module.get<TokenService>(TokenService);
    usersService = module.get<IUsersService>(IUsersService);
    sender = module.get<INotificationSender>(INotificationSender);
    options = module.get<IAuthenticationModuleOptions>(AUTH_OPTIONS);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(emailNotificationService).toBeDefined();
    expect(tokenService).toBeDefined();
    expect(usersService).toBeDefined();
    expect(options).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('resetPassword', () => {
    it('should not reset password from token that not exists', async () => {
      const spy = jest.spyOn(emailNotificationService, 'findOne').mockResolvedValue(null);
      await expect(() => service.resetPassword(resetPwd)).rejects.toThrow(UnauthorizedException);
      await expect(() => service.resetPassword(resetPwd)).rejects.toThrow(RESET_PASSWORD_ERRORS.WRONG_TOKEN);
      expect(spy).toHaveBeenCalledWith({
        category: NOTIFICATION_CATEGORY.RESET_CREDENTIALS,
        token: resetPwd.token,
      });
    });
    it('should not reset password from expired token', async () => {
      const doc = mockOldForgottenPasswordDoc;
      const spy = jest.spyOn(emailNotificationService, 'findOne').mockResolvedValue(doc as any);
      await expect(() => service.resetPassword(resetPwdExpToken)).rejects.toThrow(UnauthorizedException);
      await expect(() => service.resetPassword(resetPwdExpToken)).rejects.toThrow(RESET_PASSWORD_ERRORS.TOKEN_EXPIRED);
      expect(spy).toHaveBeenCalledWith({
        category: NOTIFICATION_CATEGORY.RESET_CREDENTIALS,
        token: resetPwd.token,
      });
    });
  });

  describe('sendForgottenPasswordEmail', () => {
    it('should not send forgotten password email to not registered user', async () => {
      const spy = jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
      await expect(() => service.sendForgottenPasswordEmail(userLocal.email, address)).rejects.toThrow(
        NotFoundException,
      );
      await expect(() => service.sendForgottenPasswordEmail(userLocal.email, address)).rejects.toThrow(
        LOGIN_ERRORS.USER_NOT_FOUND,
      );
      expect(spy).toHaveBeenCalledWith({ email: userLocal.email });
    });
    it('should not send forgotten password email when error during send', async () => {
      const spyOnUsersService = jest.spyOn(usersService, 'findOne').mockResolvedValue(userLocal as any);
      const spyOnEmailNotificationFind = jest
        .spyOn(emailNotificationService, 'findOne')
        .mockResolvedValue(mockOldForgottenPasswordDoc as any);
      jest.spyOn(emailNotificationService, 'findOneAndUpdate').mockResolvedValue(mockForgottenPasswordDoc as any);
      jest.spyOn(sender, 'notify').mockResolvedValue(false);
      await expect(() => service.sendForgottenPasswordEmail(userLocal.email, address)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(() => service.sendForgottenPasswordEmail(userLocal.email, address)).rejects.toThrow(
        EMAIL_ERRORS.EMAIL_NOT_SENT,
      );
      expect(spyOnUsersService).toHaveBeenCalledWith({ email: userLocal.email });
      expect(spyOnEmailNotificationFind).toHaveBeenCalledWith({
        to: userLocal.email,
        category: NOTIFICATION_CATEGORY.RESET_CREDENTIALS,
      });
    });
    it('should not send forgotten password email when recently sent', async () => {
      const spyOnUsersService = jest.spyOn(usersService, 'findOne').mockResolvedValue(userLocal as any);
      const spyOnEmailNotificationFind = jest
        .spyOn(emailNotificationService, 'findOne')
        .mockResolvedValue(mockForgottenPasswordDoc as any);
      await expect(() => service.sendForgottenPasswordEmail(userLocal.email, address)).rejects.toThrow(
        ConflictException,
      );
      await expect(() => service.sendForgottenPasswordEmail(userLocal.email, address)).rejects.toThrow(
        EMAIL_ERRORS.EMAIL_SENT_RECENTLY,
      );
      expect(spyOnUsersService).toHaveBeenCalledWith({ email: userLocal.email });
      expect(spyOnEmailNotificationFind).toHaveBeenCalledWith({
        to: userLocal.email,
        category: NOTIFICATION_CATEGORY.RESET_CREDENTIALS,
      });
    });
  });

  describe('sendVerificationEmail', () => {
    it('should not send verification email to not registered user', async () => {
      const spy = jest.spyOn(emailNotificationService, 'findOne').mockResolvedValue(null);
      await expect(() => service.sendVerificationEmail(userLocal.email, address)).rejects.toThrow(NotFoundException);
      await expect(() => service.sendVerificationEmail(userLocal.email, address)).rejects.toThrow(
        EMAIL_ERRORS.USER_NOT_FOUND,
      );
      expect(spy).toHaveBeenCalledWith({
        to: userLocal.email,
        category: NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION,
      });
    });
    it('should not send verification email when error during send', async () => {
      const spyOnEmailServiceFind = jest
        .spyOn(emailNotificationService, 'findOne')
        .mockResolvedValue(mockOldVerificationEmailDoc as any);
      const spyOnModelFindAndUpdate = jest
        .spyOn(emailNotificationService, 'findOneAndUpdate')
        .mockResolvedValue(mockVerificationEmailDoc as any);
      const spyOnEmailServiceSend = jest.spyOn(sender, 'notify').mockResolvedValue(false);

      await expect(() => service.sendVerificationEmail(userLocal.email, address)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(() => service.sendVerificationEmail(userLocal.email, address)).rejects.toThrow(
        EMAIL_ERRORS.EMAIL_NOT_SENT,
      );
      expect(spyOnEmailServiceFind).toHaveBeenCalledWith({
        to: userLocal.email,
        category: NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION,
      });
    });
    it('should not send verification email when recently sent', async () => {
      const spyOnEmailServiceFind = jest
        .spyOn(emailNotificationService, 'findOne')
        .mockResolvedValue(mockVerificationEmailDoc as any);
      await expect(() => service.sendVerificationEmail(userLocal.email, address)).rejects.toThrow(ConflictException);
      await expect(() => service.sendVerificationEmail(userLocal.email, address)).rejects.toThrow(
        EMAIL_ERRORS.EMAIL_SENT_RECENTLY,
      );
      expect(spyOnEmailServiceFind).toHaveBeenCalledWith({
        to: userLocal.email,
        category: NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION,
      });
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email', async () => {
      const spyOnEmailServiceFind = jest
        .spyOn(emailNotificationService, 'findOne')
        .mockResolvedValue(mockVerificationEmailDoc as any);
      const spyOnService = jest.spyOn(service, 'sendVerificationEmail').mockResolvedValue(Promise.resolve(true));
      const getResponse = await service.resendVerificationEmail(userLocal.email, address);
      expect(spyOnEmailServiceFind).toHaveBeenCalledWith({
        to: userLocal.email,
        category: NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION,
      });
      expect(spyOnService).toHaveBeenCalledWith(mockVerificationEmailDoc.to, address);
      expect(getResponse).toEqual(true);
    });
    it('should not resend verification email to not previously registered user', async () => {
      const spyOnEmailServiceFind = jest.spyOn(emailNotificationService, 'findOne').mockResolvedValue(null);
      await expect(() => service.resendVerificationEmail(userLocal.email, address)).rejects.toThrow(NotFoundException);
      await expect(() => service.resendVerificationEmail(userLocal.email, address)).rejects.toThrow(
        EMAIL_ERRORS.USER_NOT_FOUND,
      );
      expect(spyOnEmailServiceFind).toHaveBeenCalledWith({
        to: userLocal.email,
        category: NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION,
      });
    });
    it('should not resend verification email when error during send', async () => {
      const spyOnEmailServiceFind = jest
        .spyOn(emailNotificationService, 'findOne')
        .mockResolvedValue(mockVerificationEmailDoc as any);
      const spyOnService = jest.spyOn(service, 'sendVerificationEmail').mockResolvedValue(Promise.resolve(false));
      await expect(() => service.resendVerificationEmail(userLocal.email, address)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(() => service.resendVerificationEmail(userLocal.email, address)).rejects.toThrow(
        EMAIL_ERRORS.EMAIL_NOT_SENT,
      );
      expect(spyOnEmailServiceFind).toHaveBeenCalledWith({
        to: userLocal.email,
        category: NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION,
      });
      expect(spyOnService).toHaveBeenCalledWith(mockVerificationEmailDoc.to, address);
    });
  });

  describe('login', () => {
    it('should not login user with wrong credentials', async () => {
      const credentials: LoginDto = {
        email: 'user@email.com',
        password: 'myPassword',
      };
      const onSpyUsersService = jest.spyOn(usersService, 'validateUser').mockResolvedValue(null);
      await expect(() => service.login(credentials, userIp)).rejects.toThrow(UnauthorizedException);
      await expect(() => service.login(credentials, userIp)).rejects.toThrow(LOGIN_ERRORS.WRONG_CREDENTIALS);
      expect(onSpyUsersService).toHaveBeenCalledWith(credentials.email, credentials.password);
    });
    it('should not login not verified user', async () => {
      const date = new Date();
      const credentials: LoginDto = {
        email: 'user@email.com',
        password: 'myPassword',
      };
      const notVerifiedUser: Partial<User> = {
        email: 'user@email.com',
        password: 'myPassword',
        roles: [],
        isVerified: false,
        createdAt: date,
        updatedAt: date,
        _id: '1234',
      };
      const onSpyUsersService = jest.spyOn(usersService, 'validateUser').mockResolvedValue(notVerifiedUser as any);
      await expect(() => service.login(credentials, userIp)).rejects.toThrow(UnauthorizedException);
      await expect(() => service.login(credentials, userIp)).rejects.toThrow(LOGIN_ERRORS.USER_NOT_VERIFIED);
      expect(onSpyUsersService).toHaveBeenCalledWith(credentials.email, credentials.password);
    });
  });

  describe('verifyEmail', () => {
    it('should not verify email with wrong code', async () => {
      const notification: IEmailNotification = {
        to: 'user@email.com',
        token: '1234567',
        category: NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION,
      };
      const spy = jest.spyOn(emailNotificationService, 'findOne').mockResolvedValue(null);
      await expect(() => service.verifyEmail(notification.token)).rejects.toThrow(NotFoundException);
      await expect(() => service.verifyEmail(notification.token)).rejects.toThrow(EMAIL_ERRORS.EMAIL_WRONG_VERIFY_CODE);
    });
  });
});

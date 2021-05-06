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
  AuthOptions,
  IEmailNotification,
  INotificationSender,
  IUsersService,
  NOTIFICATION_CATEGORY,
} from './interfaces';
import { Document } from 'mongoose';
import { LoginDto, ResetPasswordDto, User } from './dto';
import * as mocks from 'node-mocks-http';
import { EmailNotification } from './models';
import { UserIdentityService } from './user-identity/user-identity.service';
import { EmailNotificationService } from './notification';

const addMinutes = function (dt, minutes) {
  return new Date(dt.getTime() + minutes * 60000);
};
const date = new Date();
const oldDate = addMinutes(date, -16);
interface UserDoc extends Document {
  email: string;
  password: string;
  roles: string[];
  isVerified: boolean;
  socialProvider: string;
  createdAt?: Date;
  updatedAt?: Date;
  id: string;
}
const userLocal: Partial<UserDoc> = {
  email: 'user@email.com',
  password: 'myPassword',
  roles: [],
  isVerified: true,
  socialProvider: 'local',
  createdAt: date,
  updatedAt: date,
  id: '111111',
};
const userLocalNotVerified: Partial<UserDoc> = {
  email: 'user@email.com',
  password: 'myPassword',
  roles: [],
  isVerified: false,
  socialProvider: 'local',
  createdAt: date,
  updatedAt: date,
  id: '00000000',
};
const userGoogle: Partial<UserDoc> = {
  email: 'user@email.com',
  password: 'myPassword',
  roles: [],
  isVerified: true,
  socialProvider: 'local',
  createdAt: date,
  updatedAt: date,
  id: '2222222',
};

const mockForgottenPasswordDoc: Partial<EmailNotification> = {
  id: '1',
  to: 'user@email.com',
  token: '1234567',
  category: NOTIFICATION_CATEGORY.RESET_CREDENTIALS,
  createdAt: date,
  updatedAt: date,
};
const mockOldForgottenPasswordDoc: Partial<EmailNotification> = {
  id: '2',
  to: 'user@email.com',
  token: '1234567',
  category: NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION,
  createdAt: oldDate,
  updatedAt: oldDate,
};
const mockVerificationEmailDoc: Partial<EmailNotification> = {
  id: '3',
  to: 'user@email.com',
  token: '1234567',
  category: NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION,
  createdAt: date,
  updatedAt: date,
};
const mockOldVerificationEmailDoc: Partial<EmailNotification> = {
  id: '4',
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

const req = mocks.createRequest();
req.res = mocks.createResponse();
req.user = { id: userGoogle._id };

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
  let usersService: IUsersService;
  let options: AuthOptions;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: TokenService,
          useValue: {
            refresh: jest.fn(),
            deleteRefreshTokenForUser: jest.fn(),
            createAccessToken: jest.fn(),
            createRefreshToken: jest.fn(),
            verifyAccessToken: jest.fn(),
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
          provide: AUTH_OPTIONS,
          useValue: {
            usersService: {
              validateUser: jest.fn(),
              create: jest.fn(),
              findByEmail: jest.fn(),
              updateById: jest.fn(),
              setPassword: jest.fn().mockResolvedValue(true),
            },
            notificationSender: new MockSender(),

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
    options = module.get<AuthOptions>(AUTH_OPTIONS);
    usersService = options.usersService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(usersService).toBeDefined();
    expect(options).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should not login user with wrong credentials', async () => {
      const credentials: LoginDto = {
        email: 'user@email.com',
        password: 'myPassword',
      };
      const onSpyUsersService = jest.spyOn(usersService, 'validateUser').mockImplementationOnce(async () => null);
      await expect(() => service.login(credentials)).rejects.toThrow(NotFoundException);
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
        id: '1234',
      };
      const onSpyUsersService = jest.spyOn(usersService, 'validateUser').mockImplementationOnce(
        async (): Promise<User> => {
          return notVerifiedUser as any;
        },
      );
      await expect(() => service.login(credentials)).rejects.toThrow(UnauthorizedException);
      expect(onSpyUsersService).toHaveBeenCalledWith(credentials.email, credentials.password);
    });
  });
});

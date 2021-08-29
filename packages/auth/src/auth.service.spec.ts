import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';
import { AUTH_OPTIONS } from './constants';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthOptions, IUsersService } from './interfaces';
import { LoginDto, User } from './dto';
import { UserIdentityService } from './user-identity/user-identity.service';

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
            blockNotVerifiedUser: true,
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
      const onSpyUsersService = jest
        .spyOn(usersService, 'validateUser')
        .mockImplementationOnce(async (): Promise<User> => {
          return notVerifiedUser as any;
        });
      await expect(() => service.login(credentials)).rejects.toThrow(UnauthorizedException);
      expect(onSpyUsersService).toHaveBeenCalledWith(credentials.email, credentials.password);
    });
  });
});

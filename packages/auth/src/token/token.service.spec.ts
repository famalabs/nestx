import { AuthOptions, IRefreshToken } from '../interfaces';
import { JwtService } from '@nestjs/jwt';
import { ReturnModelType } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';
import { RefreshToken } from '../models';
import { TokenService } from './token.service';
import { getModelToken } from '@nestjs/mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { AUTH_OPTIONS, REFRESH_TOKEN_ERRORS } from '../constants';
import { BadRequestException, CACHE_MANAGER } from '@nestjs/common';

const blackList = {};

class MockRefreshToken implements IRefreshToken {
  value: string;
  userId: string;
  expiresAt: Date;
}

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;
  let options: AuthOptions;
  let model: ReturnModelType<AnyParamConstructor<RefreshToken>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: getModelToken(RefreshToken.name),
          // notice that only the functions we call from the model are mocked
          useValue: {
            findOne: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: AUTH_OPTIONS,
          useValue: {
            modules: {
              jwt: {
                signOptions: {
                  expiresIn: '900',
                },
              },
            },
            constants: {
              jwt: {
                refreshTokenTTL: 10,
              },
            },
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            values: blackList,
            get: jest.fn().mockImplementation((accessToken: string) => blackList[accessToken]),
            set: jest
              .fn()
              .mockImplementation((accessToken: string, userId: string) => (blackList[accessToken] = userId)),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
    options = module.get<AuthOptions>(AUTH_OPTIONS);
    model = module.get<ReturnModelType<AnyParamConstructor<RefreshToken>>>(getModelToken(RefreshToken.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(options).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('refresh', () => {
    it('should not get new access and refresh token with an expired refresh token', async () => {
      const addMinutes = function (dt, minutes) {
        return new Date(dt.getTime() + minutes * 60000);
      };
      const date = new Date();
      const oldDate = addMinutes(date, -16);

      const mockRefreshToken = new MockRefreshToken();
      mockRefreshToken.value = 'refreshToken';
      mockRefreshToken.expiresAt = oldDate;
      mockRefreshToken.userId = 'userId';

      await expect(() => service.refresh(mockRefreshToken.value)).rejects.toThrow(BadRequestException);
      await expect(() => service.refresh(mockRefreshToken.value)).rejects.toThrow(REFRESH_TOKEN_ERRORS.TOKEN_EXPIRED);
    });
  });
});

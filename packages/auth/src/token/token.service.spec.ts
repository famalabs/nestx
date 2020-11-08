import { IAuthenticationModuleOptions, IJwtPayload, ILoginResponse, IRefreshToken } from '../interfaces';
import { JwtService } from '@nestjs/jwt';
import { ReturnModelType } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';
import { RefreshToken } from '../models';
import { TokenService } from './token.service';
import { getModelToken } from '@nestjs/mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { AUTH_OPTIONS } from '../constants';
import { CACHE_MANAGER } from '@nestjs/common';
import { BaseService } from '../shared/base-service';
const blackList = {};
const payload: IJwtPayload = {
  sub: 'userId',
};
const loginResponse: ILoginResponse = {
  accessToken: 'accessToken',
  expiresIn: '900',
  tokenType: 'Bearer',
};
const tokenContent = {
  userId: 'userId',
  clientId: '',
  ipAddress: '',
};
const refreshToken: RefreshToken = {
  value: 'refreshToken',
  userId: 'userId',
  expiresAt: new Date(),
  clientId: '',
  ipAddress: '',
};

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;
  let options: IAuthenticationModuleOptions;
  let model: ReturnModelType<AnyParamConstructor<RefreshToken>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: getModelToken(RefreshToken.name),
          // notice that only the functions we call from the model are mocked
          useValue: {
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
    options = module.get<IAuthenticationModuleOptions>(AUTH_OPTIONS);
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

  describe('createAccessToken', () => {
    it('should create access Token', async () => {
      const onSpyJwtSign = jest.spyOn(jwtService, 'sign').mockReturnValue('accessToken');
      expect(service.createAccessToken(payload)).resolves.toEqual(loginResponse);
    });
  });

  describe('createRefreshToken', () => {
    it('should create access Token', async () => {
      const crypto = require('crypto');
      const spyOnRandomBytes = jest.spyOn(crypto, 'randomBytes').mockReturnValue('refreshToken');
      const spyOnCreate = jest.spyOn(TokenService.prototype, 'create').mockResolvedValue(null);
      expect(service.createRefreshToken(tokenContent)).resolves.toBe(refreshToken);
    });
  });

  // describe('isBlackListed', () => {

  // })
});

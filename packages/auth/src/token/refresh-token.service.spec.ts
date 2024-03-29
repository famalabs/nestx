import { AuthOptions, IRefreshToken } from '../interfaces';
import { ReturnModelType } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';
import { RefreshToken } from '../models';
import { getModelToken } from '@nestjs/mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { AUTH_OPTIONS, REFRESH_TOKEN_ERRORS } from '../constants';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { JwtTokenService } from './jwt-token.service';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let options: AuthOptions;
  let model: ReturnModelType<AnyParamConstructor<RefreshToken>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [
        RefreshTokenService,
        JwtTokenService,
        {
          provide: getModelToken(RefreshToken.name),
          useValue: {
            findOne: jest.fn(),
            deleteMany: jest.fn(),
            deleteById: jest.fn(),
          },
        },
        {
          provide: AUTH_OPTIONS,
          useValue: {
            refreshTokenConfig: {
              signOptions: {
                expiresIn: 30 * 24 * 60 * 60,
                secret: 'refresh_token_secret',
              },
              verifyOptions: {
                secret: 'refresh_token_secret',
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    options = module.get<AuthOptions>(AUTH_OPTIONS);
    model = module.get<ReturnModelType<AnyParamConstructor<RefreshToken>>>(getModelToken(RefreshToken.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(options).toBeDefined();
    expect(model).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});

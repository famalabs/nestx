import { AuthOptions, IJwtPayload, IRefreshToken } from '../interfaces';
import { JwtModule, JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { TestingModule, Test } from '@nestjs/testing';
import { AUTH_OPTIONS } from '../constants';
import { AccessTokenService } from './access-token.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtTokenService } from './jwt-token.service';

describe('AccessTokenService', () => {
  let service: AccessTokenService;
  let jwtService: JwtService;
  let options: AuthOptions;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [
        AccessTokenService,
        JwtTokenService,
        {
          provide: AUTH_OPTIONS,
          useValue: {
            accessTokenConfig: {
              signOptions: {
                expiresIn: 5 * 60,
                secret: 'secret',
              },
              verifyOptions: { secret: 'secret' },
            },
          },
        },
      ],
    }).compile();

    service = module.get<AccessTokenService>(AccessTokenService);
    jwtService = module.get<JwtService>(JwtService);
    options = module.get<AuthOptions>(AUTH_OPTIONS);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(options).toBeDefined();
  });

  describe('token handle', () => {
    it('should create valid accessToken', async () => {
      const payload: IJwtPayload = {
        sub: {
          id: '001',
          roles: [],
        },
      };
      const token = await service.create(payload);
      expect(token).toBeDefined();
      const valid = await service.verify(token);
      expect(valid.sub.id).toBe('001');
    });

    it('should detect invalid accessToken', async () => {
      const invalidToken = 'invalidToken';
      await expect(() => service.verify(invalidToken)).rejects.toThrow(UnauthorizedException);
    });
  });
});

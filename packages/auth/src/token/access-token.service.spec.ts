import { AuthOptions, IJwtPayload, IRefreshToken } from '../interfaces';
import { JwtModule, JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { TestingModule, Test } from '@nestjs/testing';
import { AUTH_OPTIONS } from '../constants';
import { AccessTokenService } from './access-token.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AccessTokenService', () => {
  let service: AccessTokenService;
  let jwtService: JwtService;
  let options: AuthOptions;

  const jwtConfig: JwtModuleOptions = { secret: 'secret', signOptions: { expiresIn: 900 }, verifyOptions: {} };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register(jwtConfig)],
      providers: [
        AccessTokenService,
        {
          provide: AUTH_OPTIONS,
          useValue: { jwtModuleConfig: jwtConfig },
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
      const valid = jwtService.verify<IJwtPayload>(token);
      expect(valid.sub.id).toBe('001');
    });

    it('should detect invalid accessToken', async () => {
      const invalidToken = 'invalidToken';
      await expect(() => service.verify(invalidToken)).rejects.toThrow(UnauthorizedException);
    });
  });
});

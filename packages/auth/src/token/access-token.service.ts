import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { AuthOptions, IJwtPayload } from '../interfaces';
import { AUTH_OPTIONS, JWT_ERRORS } from '../constants';
import { JwtTokenService } from './jwt-token.service';

export interface IAccessTokenService {
  create(payload: IJwtPayload): Promise<string>;
  verify(token: string): Promise<IJwtPayload>;
}

@Injectable()
export class AccessTokenService implements IAccessTokenService {
  private verifyOptions: JwtVerifyOptions;
  private signOptions: JwtSignOptions;
  constructor(private jwtTokenService: JwtTokenService, @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions) {
    this.signOptions = _AuthOptions.accessTokenConfig.signOptions;
    this.verifyOptions = _AuthOptions.accessTokenConfig.verifyOptions;
  }

  async create(payload: IJwtPayload): Promise<string> {
    return await this.jwtTokenService.create(payload, this.signOptions);
  }

  async verify(token: string): Promise<IJwtPayload> {
    try {
      return this.jwtTokenService.verify(token, this.verifyOptions);
    } catch (err) {
      throw new UnauthorizedException(JWT_ERRORS.TOKEN_NOT_VALID);
    }
  }
}

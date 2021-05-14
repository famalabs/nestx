import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { AuthOptions, IJwtPayload } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';
import { AUTH_OPTIONS, JWT_ERRORS } from '../constants';
import { JwtTokenService } from './jwt-token.service';

export interface IAccessTokenService {
  create(payload: IJwtPayload): Promise<string>;
  verify(token: string): Promise<IJwtPayload>;
}

@Injectable()
export class AccessTokenService implements IAccessTokenService {
  constructor(private jwtTokenService: JwtTokenService, @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions) {}

  async create(payload: IJwtPayload): Promise<string> {
    return await this.jwtTokenService.create(payload);
  }

  async verify(token: string): Promise<IJwtPayload> {
    try {
      return this.jwtTokenService.verify<IJwtPayload>(token);
    } catch (err) {
      throw new UnauthorizedException(JWT_ERRORS.TOKEN_NOT_VALID);
    }
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { IJwtPayload } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';
import { JWT_ERRORS } from '../constants';
export interface IJwtTokenService {
  create(payload: IJwtPayload): Promise<string>;
  verify(token: string): Promise<IJwtPayload>;
}

@Injectable()
export class JwtTokenService implements JwtTokenService {
  constructor(private jwtService: JwtService) {}

  async create(payload: any, options: JwtSignOptions): Promise<string> {
    const signOptions = {} as JwtSignOptions;
    Object.assign(signOptions, options);
    signOptions.jwtid = uuidv4();
    const token = this.jwtService.sign({ ...payload, iat: Date.now() }, signOptions);
    return token;
  }

  async verify(token: string, options: JwtVerifyOptions): Promise<IJwtPayload> {
    try {
      const verifyOptions = {} as JwtVerifyOptions;
      Object.assign(verifyOptions, options);
      return this.jwtService.verify<IJwtPayload>(token, verifyOptions);
    } catch (err) {
      throw new UnauthorizedException(JWT_ERRORS.TOKEN_NOT_VALID);
    }
  }
}

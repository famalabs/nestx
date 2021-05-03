import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtModuleOptions, JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { AuthOptions, IJwtPayload } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';
import { AUTH_OPTIONS, JWT_ERRORS, JWT_OPTIONS } from '../constants';

export interface IAccessTokenService {
  create(payload: IJwtPayload): Promise<string>;
  verify(token: string): Promise<IJwtPayload>;
}

@Injectable()
export class AccessTokenService implements IAccessTokenService {
  private signOptions: JwtSignOptions;
  private verifyOptions: JwtVerifyOptions;
  constructor(private jwtService: JwtService, @Inject(JWT_OPTIONS) private jwtOptions: JwtModuleOptions) {
    this.signOptions = this.jwtOptions.signOptions;
    this.verifyOptions = this.jwtOptions.verifyOptions;
  }

  async create(payload: IJwtPayload): Promise<string> {
    const signOptions = {} as JwtSignOptions;
    Object.assign(signOptions, this.signOptions);
    signOptions.jwtid = uuidv4();
    const token = this.jwtService.sign(payload, signOptions);
    return token;
  }

  async verify(token: string): Promise<IJwtPayload> {
    try {
      return this.jwtService.verify<IJwtPayload>(token, this.verifyOptions);
    } catch (err) {
      throw new UnauthorizedException(JWT_ERRORS.TOKEN_NOT_VALID);
    }
  }
}

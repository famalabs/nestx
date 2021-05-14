import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { AuthOptions, IJwtPayload } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';
import { AUTH_OPTIONS, JWT_ERRORS } from '../constants';

export interface IJwtTokenService {
  create(payload: IJwtPayload): Promise<string>;
  verify(token: string): Promise<IJwtPayload>;
}

@Injectable()
export class JwtTokenService implements JwtTokenService {
  private signOptions: JwtSignOptions;
  private verifyOptions: JwtVerifyOptions;
  constructor(private jwtService: JwtService, @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions) {
    this.signOptions = this._AuthOptions.jwtModuleConfig.signOptions;
    this.verifyOptions = this._AuthOptions.jwtModuleConfig.verifyOptions;
  }

  async create(payload: any, expiresIn?: number): Promise<string> {
    const signOptions = {} as JwtSignOptions;
    Object.assign(signOptions, this.signOptions);
    if (expiresIn) {
      signOptions.expiresIn = expiresIn;
    }
    signOptions.jwtid = uuidv4();
    const token = this.jwtService.sign(payload, signOptions);
    return token;
  }

  async verify<T extends Object>(token: string): Promise<T> {
    try {
      return this.jwtService.verify<T>(token, this.verifyOptions);
    } catch (err) {
      throw new UnauthorizedException(JWT_ERRORS.TOKEN_NOT_VALID);
    }
  }
}

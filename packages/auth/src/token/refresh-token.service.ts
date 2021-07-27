import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { CrudService } from '@famalabs/nestx-core';
import { AuthOptions, IRefreshToken } from '../interfaces';
import { RefreshToken } from '../models';
import { AUTH_OPTIONS, JWT_ERRORS, REFRESH_TOKEN_ERRORS } from '../constants';
import { JwtTokenService } from './jwt-token.service';
import { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

export interface IRefreshTokenService {
  createTokenForUser(userId: string): Promise<IRefreshToken>;
  verify(token: string): Promise<IRefreshToken>;
  deleteRefreshTokenForUser(userId: string): Promise<void>;
}

@Injectable()
export class RefreshTokenService extends CrudService<DocumentType<RefreshToken>> implements IRefreshTokenService {
  private verifyOptions: JwtVerifyOptions;
  private signOptions: JwtSignOptions;
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly _tokenModel: ReturnModelType<typeof RefreshToken>,
    @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions,
    private jwtTokenService: JwtTokenService,
  ) {
    super(_tokenModel);
    this.signOptions = _AuthOptions.constants.jwt.refreshTokenSignOptions;
    this.verifyOptions = _AuthOptions.constants.jwt.refreshTokenVerifyOptions;
  }

  async verify(token: string): Promise<IRefreshToken> {
    try {
      const doc = await this.findOne({ value: token });
      if (!doc) {
        throw new NotFoundException(REFRESH_TOKEN_ERRORS.TOKEN_NOT_FOUND);
      }
      await this.jwtTokenService.verify(token, this.verifyOptions);
      return doc;
    } catch (err) {
      throw new UnauthorizedException(JWT_ERRORS.TOKEN_NOT_VALID);
    }
  }

  async createTokenForUser(userId: string): Promise<IRefreshToken> {
    const jwtToken = await this.jwtTokenService.create({}, this.signOptions);
    const payload = await this.jwtTokenService.verify(jwtToken, this.verifyOptions);
    const expiresAt = payload.exp;
    const token: IRefreshToken = {
      userId: userId,
      value: jwtToken,
      expires: expiresAt,
    };
    const refreshToken = await this.create(token);
    return refreshToken;
  }

  async deleteRefreshTokenForUser(userId: string): Promise<void> {
    await this.model.deleteMany({ userId: { $eq: userId } }).exec();
  }
}

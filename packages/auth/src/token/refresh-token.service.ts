import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { CrudService } from '@famalabs/nestx-core';
import { AuthOptions, IJwtPayload, IRefreshToken } from '../interfaces';
import { RefreshToken } from '../models';
import { AUTH_OPTIONS, REFRESH_TOKEN_ERRORS } from '../constants';
import { JwtTokenService } from './jwt-token.service';
import { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

export interface IRefreshTokenService {
  createTokenForUser(userId: string): Promise<IRefreshToken>;
  refresh(token: string): Promise<IRefreshToken>;
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

  async refresh(token: string): Promise<IRefreshToken> {
    const doc = await this.findOne({ value: token });
    if (!doc) {
      throw new NotFoundException(REFRESH_TOKEN_ERRORS.TOKEN_NOT_FOUND);
    }
    await this.jwtTokenService.verify(token, this.verifyOptions);
    await this.deleteById(doc.id);
    const refreshToken = await this.createTokenForUser(doc.userId);
    return refreshToken;
  }

  async createTokenForUser(userId: string): Promise<IRefreshToken> {
    const jwtToken = await this.jwtTokenService.create({}, this.signOptions);
    const payload = await this.jwtTokenService.verify(jwtToken, this.verifyOptions);
    const expiresAt = new Date(payload.exp * 1000);
    const token: IRefreshToken = {
      userId: userId,
      value: jwtToken,
      expiresAt: expiresAt,
    };
    const refreshToken = await this.create(token);
    return refreshToken;
  }

  async deleteRefreshTokenForUser(userId: string): Promise<void> {
    await this.model.deleteMany({ userId: { $eq: userId } }).exec();
  }
}

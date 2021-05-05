import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { randomBytes } from 'crypto';
import { CrudService } from '@famalabs/nestx-core';
import { AuthOptions, IRefreshToken } from '../interfaces';
import { RefreshToken } from '../models';
import { AUTH_OPTIONS, REFRESH_TOKEN_ERRORS } from '../constants';

export interface IRefreshTokenService {
  createTokenForUser(userId: string): Promise<IRefreshToken>;
  refresh(token: string): Promise<IRefreshToken>;
  deleteRefreshTokenForUser(userId: string): Promise<void>;
}

@Injectable()
export class RefreshTokenService extends CrudService<DocumentType<RefreshToken>> implements IRefreshTokenService {
  private refreshTokenTtl: number;

  constructor(
    @InjectModel(RefreshToken.name)
    private readonly _tokenModel: ReturnModelType<typeof RefreshToken>,
    @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions,
  ) {
    super(_tokenModel);
    this.refreshTokenTtl = _AuthOptions.constants.jwt.refreshTokenTTL;
  }

  async refresh(token: string): Promise<IRefreshToken> {
    const doc = await super.findOne({ value: token });
    if (!doc) {
      throw new NotFoundException(REFRESH_TOKEN_ERRORS.TOKEN_NOT_FOUND);
    }

    const currentDate = new Date();
    if (doc.expiresAt < currentDate) {
      throw new BadRequestException(REFRESH_TOKEN_ERRORS.TOKEN_EXPIRED);
    }

    await this.deleteById(doc.id);
    const refreshToken = await this.createTokenForUser(doc.userId);
    return refreshToken;
  }

  async createTokenForUser(userId: string): Promise<IRefreshToken> {
    const date = new Date();
    const token: IRefreshToken = {
      userId: userId,
      value: randomBytes(64).toString('hex'),
      expiresAt: new Date(date.setDate(date.getDate() + this.refreshTokenTtl)),
    };
    const refreshToken = await super.create(token);
    return refreshToken;
  }

  async deleteRefreshTokenForUser(userId: string): Promise<void> {
    await this.model.deleteMany({ userId: { $eq: userId } }).exec();
  }
}

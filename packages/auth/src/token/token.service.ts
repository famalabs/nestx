import { Injectable } from '@nestjs/common';
import { IJwtPayload, IRefreshToken } from '../interfaces/oauth';
import { AccessTokenService } from './access-token.service';
import { RefreshTokenService } from './refresh-token.service';

export interface ITokenService {
  verifyRefreshToken(token: string): Promise<IRefreshToken>;
  deleteRefreshTokenForUser(userId: string): Promise<void>;
  createAccessToken(payload: IJwtPayload): Promise<string>;
  createRefreshToken(userId: string): Promise<IRefreshToken>;
  verifyAccessToken(token: string): Promise<IJwtPayload>;
}

@Injectable()
export class TokenService implements ITokenService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async verifyRefreshToken(token: string): Promise<IRefreshToken> {
    return await this.refreshTokenService.verify(token);
  }

  async deleteRefreshTokenForUser(userId: string): Promise<void> {
    await this.refreshTokenService.deleteRefreshTokenForUser(userId);
  }

  async createAccessToken(payload: IJwtPayload): Promise<string> {
    return await this.accessTokenService.create(payload);
  }

  async createRefreshToken(userId: string): Promise<IRefreshToken> {
    return await this.refreshTokenService.createTokenForUser(userId);
  }

  async verifyAccessToken(token: string): Promise<IJwtPayload> {
    return await this.accessTokenService.verify(token);
  }
}

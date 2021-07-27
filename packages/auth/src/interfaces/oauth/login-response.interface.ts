import { IRefreshToken } from './refresh-token.interface';

export type TokenType = 'Bearer';

export interface ILoginResponse extends IAccessToken {
  refreshToken: string;
}

export interface IAccessToken {
  accessToken: string;
  tokenType: TokenType;
  expires: number;
}

export interface ITokens {
  accessToken: string;
  refreshToken: IRefreshToken;
}

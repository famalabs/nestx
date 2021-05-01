export type TokenType = 'Bearer';

export interface ILoginResponse extends IAccessToken {
  refreshToken: string;
}

export interface IAccessToken {
  accessToken: string;
  tokenType: TokenType;
  expiresIn: number;
}

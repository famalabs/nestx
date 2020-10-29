export interface ILoginResponse {
  accessToken: string;
  tokenType?: string;
  expiresIn: string | number;
  refreshToken?: string;
}

export interface IAccessToken{
  accessToken: string;
  tokenType?: string;
  expiresIn: string | number;
}


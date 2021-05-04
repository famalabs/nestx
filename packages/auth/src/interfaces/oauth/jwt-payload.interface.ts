export interface IJwtPayload {
  sub: IJwtSub;
  iat?: number;
  exp?: number;
  jti?: string;
}

export interface IJwtSub {
  id: string;
  roles: string[];
}

export interface ReqWithUser extends Request {
  user: IJwtSub;
}

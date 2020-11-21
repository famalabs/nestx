export interface IJwtPayload {
  sub: { userId: string; roles: string[] };
  iat?: number;
  exp?: number;
  jti?: string;
}

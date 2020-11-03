export interface IRefreshToken {
  value: string;
  userId: string;
  expiresAt: Date;
  clientId: string;
  ipAddress: string;
}

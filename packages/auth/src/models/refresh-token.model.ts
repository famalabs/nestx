import { prop } from '@typegoose/typegoose';
import { BaseModel } from './base.model';
import { IRefreshToken } from './../interfaces/refresh-token.interface';

export class RefreshToken extends BaseModel implements IRefreshToken {
  @prop({ required: true, unique: true })
  value!: string;

  @prop({ required: true })
  userId!: string;

  @prop({ required: true })
  expiresAt!: Date;

  @prop({ required: true })
  clientId!: string;

  @prop({ required: true })
  ipAddress!: string;
}

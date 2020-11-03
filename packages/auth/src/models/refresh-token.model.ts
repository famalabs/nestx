import { getModelForClass, prop } from '@typegoose/typegoose';
import { BaseModel } from './base.model';
import { IRefreshToken } from './../interfaces/refresh-token.interface';

export class RefreshToken extends BaseModel implements IRefreshToken {
  @prop({ required: true, unique: true })
  value!: string;

  @prop()
  userId: string;

  @prop({ required: true })
  expiresAt: Date;

  @prop()
  clientId: string;

  @prop()
  ipAddress: string;
}

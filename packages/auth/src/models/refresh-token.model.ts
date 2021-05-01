import { prop } from '@typegoose/typegoose';
import { BaseModel } from '@famalabs/nestx-core';
import { IRefreshToken } from '../interfaces/oauth/refresh-token.interface';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshToken extends BaseModel implements IRefreshToken {
  @prop({ required: true, unique: true })
  value!: string;

  @prop({ required: true })
  userId!: string;

  @prop({ required: true })
  expiresAt!: Date;

  @ApiProperty({ type: Date })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  updatedAt?: Date;
}

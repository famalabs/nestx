import { index, prop } from '@typegoose/typegoose';
import { IThirdPartyUser, THIRD_PARTY_PROVIDER } from '../interfaces/oauth/third-party-user.interface';
import { BaseModel } from '@famalabs/nestx-core';
import { ApiProperty } from '@nestjs/swagger';

@index({ externalId: 1, provider: 1 }, { unique: true })
export class UserIdentity extends BaseModel implements IThirdPartyUser {
  @prop({ required: true })
  externalId: string;

  @prop({ required: true })
  email!: string;

  @prop({ required: false })
  accessToken?: string;

  @prop({ required: false })
  refreshToken?: string;

  @prop({ required: true, enum: THIRD_PARTY_PROVIDER })
  provider: THIRD_PARTY_PROVIDER;

  @prop({ required: true })
  userId: string;

  @ApiProperty({ type: Date })
  createdAt?: Date;

  @ApiProperty({ type: Date })
  updatedAt?: Date;
}

import { index, prop } from '@typegoose/typegoose';
import { BaseModel } from '@famalabs/nestx-core';
import { ApiProperty } from '@nestjs/swagger';
import { IEmailNotification, NOTIFICATION_CATEGORY } from '../interfaces';

@index({ to: 1, category: 1, token: 1 }, { unique: true })
export class EmailNotification extends BaseModel implements IEmailNotification {
  @prop({ required: true })
  to!: string;

  @prop({ required: true, enum: NOTIFICATION_CATEGORY })
  category!: NOTIFICATION_CATEGORY;

  @prop({ required: true })
  token!: string;

  @ApiProperty({ type: Date })
  createdAt?: Date;

  @ApiProperty({ type: Date })
  updatedAt?: Date;
}

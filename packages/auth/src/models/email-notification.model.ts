import { BaseModel } from './base.model';
import { IEmailNotification, NOTIFICATION_CATEGORY } from '../interfaces/notification.interface';
import { index, prop } from '@typegoose/typegoose';

@index({ to: 1, category: 1, token: 1 }, { unique: true })
export class EmailNotification extends BaseModel implements IEmailNotification {
  @prop({ required: true })
  to!: string;
  @prop({ required: true, enum: NOTIFICATION_CATEGORY })
  category!: NOTIFICATION_CATEGORY;
  @prop({ required: true })
  token!: string;
}

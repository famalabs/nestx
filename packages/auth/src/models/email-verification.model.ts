import { prop } from '@typegoose/typegoose';
import { BaseModel } from './base.model';
import { IEmailVerification } from '../interfaces/email-verification.interface';
export class EmailVerification extends BaseModel implements IEmailVerification {
  @prop()
  email: string;
  @prop()
  emailToken: string;
  @prop()
  timestamp: Date;
}

import { prop } from '@typegoose/typegoose';
import { BaseModel } from './base.model';
import { IEmailVerification } from '../interfaces/email-verification.interface';
export class EmailVerification extends BaseModel implements IEmailVerification {
  @prop()
  email: String;
  @prop()
  emailToken: String;
  @prop()
  timestamp: Date;
}

import { getModelForClass, prop } from '@typegoose/typegoose';
import { BaseModel } from './base.model';
import { IForgottenPassword } from '../interfaces/forgotten-password.interface';
export class ForgottenPassword extends BaseModel implements IForgottenPassword {
  @prop()
  email: string;
  @prop()
  newPasswordToken: string;
  @prop()
  timestamp: Date;
}

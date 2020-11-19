import { IUser } from '@famalabs/nestx-auth';
import { prop, pre } from '@typegoose/typegoose';
import * as bcrypt from 'bcrypt';
import { IsEmail } from 'class-validator';
import * as mongoose from 'mongoose';
import { BaseModel } from '../common/base.model';

export enum USER_ROLES {
  ADMIN = 'ADMIN',
}

/**
 * In your app you can add your custom properties to User.
 * Remember to implements IUser from @famalabs/nestx-auth.
 */
@pre<User>('save', async function (next: mongoose.HookNextFunction) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const hashed = await bcrypt.hash(this['password'], 10);
    this['password'] = hashed;
    return next();
  } catch (err) {
    return next(err);
  }
})
export class User extends BaseModel implements IUser {
  @IsEmail()
  @prop({ required: true, unique: true })
  email!: string;

  @prop({
    required: true,
    minlength: 8,
    select: false,
  })
  password!: string;

  @prop({ type: String, enum: USER_ROLES })
  roles: USER_ROLES[];

  @prop({ required: true, default: false })
  isVerified!: boolean;

  //other custom params
}

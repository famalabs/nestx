import { BaseModel } from '@famalabs/nestx-core';
import { IUser } from '../interfaces/user/user.interface';

export class User extends BaseModel implements IUser {
  email: string;
  password: string;
  roles: string[];
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

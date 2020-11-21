import { IUser } from '../interfaces/user.interface';
import { BaseModel } from '../models/base.model';

export class User extends BaseModel implements IUser {
  email: string;
  password: string;
  roles: string[];
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

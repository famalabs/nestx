import { IUser } from '../interfaces/user.interface';

export class User implements IUser {
  email: string;
  password: string;
  roles: string[];
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  _id: string;
}

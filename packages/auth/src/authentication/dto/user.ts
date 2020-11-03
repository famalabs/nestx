import { IUser } from '../interfaces/user.interface';
import { USER_ROLES } from '../ACLs';

export class User implements IUser {
  email: string;
  password: string;
  roles: USER_ROLES[];
  isSocial: boolean;
  isValid: boolean;
  socialProvider: string;
  createdAt?: Date;
  updatedAt?: Date;
  _id: string;
}

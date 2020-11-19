import { IBaseModel } from '../models';

export interface IUser extends IBaseModel {
  email: string;
  password: string;
  roles: string[];
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  _id: string;
}

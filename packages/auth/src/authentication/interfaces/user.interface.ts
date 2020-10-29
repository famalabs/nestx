import { USER_ROLES } from "../ACLs";
import { IBaseModel } from "../models";

export interface IUser extends IBaseModel {
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

import { USER_ROLES } from '../ACLs/constants';

export interface IUserResponse {
  email?: string;
  password?: string;
  roles?: USER_ROLES[];
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  _id: string;
}

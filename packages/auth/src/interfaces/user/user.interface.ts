import { IDType } from '@famalabs/nestx-core';

export interface IUser {
  email: string;
  password: string;
  roles?: string[];
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  _id: IDType;
}

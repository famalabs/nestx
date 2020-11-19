export interface IUserResponse {
  email?: string;
  password?: string;
  roles?: string[];
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  _id: string;
}

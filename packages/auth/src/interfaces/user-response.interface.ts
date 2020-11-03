export interface IUserResponse {
  _id: string;
  email?: string;
  isSocial?: boolean;
  isValid?: boolean;
  socialProvider?: string;
}

import { IDType } from '@famalabs/nestx-core';
import { User } from '../../dto/user';

export interface IUsersService {
  create(data: any): Promise<User>;
  findById(id: IDType): Promise<User>;
  updateById(id: IDType, data: Partial<User>): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findOneToValidate(email: string): Promise<User>;
  setPassword(email: string, newPassword: string): Promise<boolean>;
  validateUser(email: string, password: string): Promise<User | null>;
}

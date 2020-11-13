import { CreateQuery } from 'mongoose';
import { User } from '../dto/user';
export const IUsersService = Symbol('IUsersService');
export interface IUsersService {
  findOne(filter: object): Promise<User>;
  findById(id: string): Promise<User>;
  create(item: any): Promise<User>;
  delete(id: string): Promise<User>;
  update(id: string, item: Partial<User>): Promise<User>;
  findOneToValidate(email: string): Promise<User>;
  setPassword(email: string, newPassword: string): Promise<boolean>;
  validateUser(username: string, pass: string): Promise<User | null>;
}

import { Ref } from '@typegoose/typegoose';
import { User } from 'src/users/user.model';

export interface IBook {
  id?: string;
  title: string;
  user: Ref<User>;
}

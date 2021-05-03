import { BaseModel } from '@famalabs/nestx-core';
import { prop, Ref } from '@typegoose/typegoose';
import { User } from '../../users/user.model';
import { IBook } from '../interfaces/book.interface';

export class Book extends BaseModel implements IBook {
  @prop({ required: true })
  title!: string;

  @prop({ ref: () => User })
  user!: Ref<User>;
}

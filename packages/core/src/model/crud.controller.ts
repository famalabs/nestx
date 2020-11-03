import { BaseModel } from './base.model';
import { Filter, ItemFilter, Where } from './dto';

export interface ICrudController<T extends BaseModel> {
  create(data: T): Promise<T>;

  find(filter: Filter<T>): Promise<T[]>;

  count(where: Where<T>): Promise<number>;

  findById(id: T['id'], filter: ItemFilter<T>): Promise<T>;

  updateById(id: T['id'], data: T): Promise<T>;

  deleteById(id: T['id']): Promise<boolean>;
}

import { BaseModel } from './model';
import { plainToClass } from 'class-transformer';

export function toModel<T extends BaseModel>(type: new (...args: any[]) => T, obj: any): any {
  if (obj instanceof Array) {
    return obj.map(e => toModel(type, e) as T);
  } else if (obj) {
    if (obj instanceof type) {
      return obj;
    } else {
      // type should extend BaseModel
      // return new type(obj.toJSON ? obj.toJSON() : obj);
      return plainToClass(type, obj.toJSON ? obj.toJSON() : obj);
    }
  } else {
    return null;
  }
}

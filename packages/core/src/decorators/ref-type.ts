import { applyDecorators } from '@nestjs/common';
import { plainToClass, Transform } from 'class-transformer';
import { BaseModel } from '../model';
import { mongoose } from '@typegoose/typegoose';

export function RefType<T extends BaseModel>(typeFn: () => new (...args: any[]) => T): PropertyDecorator {
  return applyDecorators(
    Transform(value => {
      const type = typeFn();
      if (value instanceof Array) {
        return value.map(v => castType(type, v));
      } else {
        return castType(type, value);
      }
    }) as PropertyDecorator,
  );
}

function castType(type, value) {
  if (value instanceof type) {
    return value;
  }
  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }
  if (typeof value === 'object') {
    return plainToClass(type, value);
  }
  return value;
}

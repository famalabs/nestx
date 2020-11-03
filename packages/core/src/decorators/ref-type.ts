import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { BaseModel } from '../model';
import { mongoose } from '@typegoose/typegoose';

export function RefType<T extends BaseModel>(typeFn: () => new (...args: any[]) => T): PropertyDecorator {
  return applyDecorators(
    Transform(value => {
      const type = typeFn();
      if (value instanceof type) {
        return value;
      }
      if (value instanceof mongoose.Types.ObjectId) {
        return value.toString();
      }
      if (typeof value === 'object') {
        return new type(value);
      }
      return value;
    }) as PropertyDecorator,
  );
}

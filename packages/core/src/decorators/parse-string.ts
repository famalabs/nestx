import { applyDecorators, HttpCode } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';

export function ParseString(type: new (data?: any) => any): PropertyDecorator {
  return applyDecorators(
    Type(() => type) as PropertyDecorator, // call new, type doesn't work
    Transform(value => {
      console.log('parse string', type.name, value);
      if (value instanceof Array)
        return value.map(item => typeof item === 'string' ? Object.assign(new type(), JSON.parse(item)) : item);
      return typeof value === 'string' ? Object.assign(new type(), JSON.parse(value)) : value;
    }, { toClassOnly: true }) as PropertyDecorator,
  );
}

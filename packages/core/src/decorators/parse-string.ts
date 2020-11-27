import { applyDecorators, HttpCode } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';

export function ParseString(typeFn: () => new (...args: any[]) => any): PropertyDecorator {
  return applyDecorators(
    Type(typeFn) as PropertyDecorator, // call new, type doesn't work
    Transform(
      value => {
        console.log('parse string', typeFn, value);
        if (value instanceof Array)
          return value.map(item =>
            typeof item === 'string' ? Object.assign(new (typeFn())(), JSON.parse(item)) : item,
          );
        return typeof value === 'string' ? Object.assign(new (typeFn())(), JSON.parse(value)) : value;
      },
      { toClassOnly: true },
    ) as PropertyDecorator,
  );
}

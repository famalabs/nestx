import { applyDecorators, HttpCode } from '@nestjs/common';
import { ClassTransformOptions, plainToClass, Transform, Type } from 'class-transformer';

export function ParseString(
  typeFn: () => new (...args: any[]) => any,
  transformOptions?: ClassTransformOptions,
): PropertyDecorator {
  return applyDecorators(
    Type(typeFn) as PropertyDecorator, // call new, type doesn't work
    Transform(
      value => {
        console.log('parse string', typeFn, value);
        if (value instanceof Array)
          return value.map(item =>
            typeof item === 'string' ? plainToClass(typeFn(), JSON.parse(item), transformOptions) : item,
          );
        return typeof value === 'string' ? plainToClass(typeFn(), JSON.parse(value), transformOptions) : value;
      },
      { toClassOnly: true },
    ) as PropertyDecorator,
  );
}

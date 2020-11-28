import { applyDecorators } from '@nestjs/common';
import { classToPlain, ClassTransformOptions, plainToClass, Transform, TransformationType } from 'class-transformer';

export function JSONParse(
  typeFn: () => new (...args: any[]) => any,
  transformOptions?: ClassTransformOptions,
): PropertyDecorator {
  return applyDecorators(
    Transform(value => toType(typeFn(), value, transformOptions), { toClassOnly: true }) as PropertyDecorator,
  );
}

export function JSONStringify(transformOptions?: ClassTransformOptions): PropertyDecorator {
  return applyDecorators(
    Transform(value => toString(value, transformOptions), { toPlainOnly: true }) as PropertyDecorator,
  );
}

export function TransformJSON(
  typeFn: () => new (...args: any[]) => any,
  transformOptions?: ClassTransformOptions,
): PropertyDecorator {
  return applyDecorators(
    Transform((value, obj, transformationType: TransformationType) => {
      if (transformationType === TransformationType.PLAIN_TO_CLASS) {
        return toType(typeFn(), value, transformOptions);
      } else if (transformationType === TransformationType.CLASS_TO_PLAIN) {
        return toString(value, transformOptions);
      } else {
        return value;
      }
    }) as PropertyDecorator,
  );
}

function toType(type, value, transformOptions: ClassTransformOptions) {
  if (value instanceof Array) {
    return value.map(item =>
      typeof item === 'string' ? plainToClass(type, JSON.parse(item), transformOptions) : item,
    );
  }
  return typeof value === 'string' ? plainToClass(type, JSON.parse(value), transformOptions) : value;
}

function toString(value, transformOptions: ClassTransformOptions) {
  if (value instanceof Array) {
    return value.map(item => (typeof item === 'string' ? item : JSON.stringify(classToPlain(item, transformOptions))));
  }
  return typeof value === 'string' ? value : JSON.stringify(classToPlain(value, transformOptions));
}

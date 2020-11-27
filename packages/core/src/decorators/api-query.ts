import { applyDecorators } from '@nestjs/common';
import { ApiQuery as SrcApiQuery, ApiQueryOptions as BaseApiQueryOptions } from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { ref } from '../model';

declare type ApiQueryOptions = BaseApiQueryOptions & { name?: string; type: Function };

export function ApiQuery(options: ApiQueryOptions): MethodDecorator {
  const { name, type, ...opts } = options;
  if (name === undefined) {
    const instance = new type();
    const keys = Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES_ARRAY, instance);
    if (!(keys instanceof Array)) {
      console.error(`Type ${type} has no @ApiProperty defined. Skipping.`);
      return;
    }
    // console.log(type, keys);
    const decorators = [];
    for (const key of keys) {
      const prop = key.substr(1); // remove leading ':'
      const decorator = Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, instance, prop);
      // console.log(prop, decorator);
      decorators.push(
        ApiQuery({
          ...decorator,
          name: prop,
        }),
      );
    }
    return applyDecorators(...decorators);
  } else {
    if (!isPrimitive(type)) {
      return applyDecorators(
        SrcApiQuery({
          ...opts,
          name,
          content: { 'application/json': { schema: ref(type) } },
        }),
      );
    } else {
      // required = required === true; // required false by default
      return applyDecorators(
        SrcApiQuery(options as BaseApiQueryOptions),
        // FixQueryParam(),
      );
    }
  }
}

function isPrimitive(type) {
  return type === String || type === Number || type === Boolean;
}

function FixQueryParam(): MethodDecorator {
  return (target: any, key: PropertyKey, descriptor: PropertyDescriptor): PropertyDescriptor => {
    // Reflect.defineMetadata(DECORATORS.MODEL_RESPONSE, metadata, descriptor.value);
    // console.log(target, key, 'keys', Reflect.getMetadataKeys(descriptor.value));
    console.log(target, key, Reflect.getMetadata(DECORATORS.API_PARAMETERS, descriptor.value));
    return descriptor;
  };
}

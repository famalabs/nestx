import { applyDecorators } from '@nestjs/common';
import { ApiQuery as SrcApiQuery, ApiQueryOptions as BaseApiQueryOptions } from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import {
  MediaTypeObject,
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ref } from '../model';

declare type ApiQueryOptions =
  | (BaseApiQueryOptions & { name: string; schema: SchemaObject | ReferenceObject; type?: undefined })
  | (Omit<BaseApiQueryOptions, 'name' | 'schema'> & { name?: undefined; schema?: undefined; type: new () => any });

export function ApiQuery(options: ApiQueryOptions): MethodDecorator {
  const { name, type } = options;
  if (name === undefined) {
    const instance = new type();
    const keys = Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES_ARRAY, instance);
    // console.log(type, keys);
    const decorators = [];
    for (const key of keys) {
      const prop = key.substr(1); // remove leading ':'
      const decorator = Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, instance, prop);
      const { type: prop_type, ...params } = decorator;
      // console.log(prop, decorator, prop_type, isPrimitive(prop_type));
      if (prop_type && !isPrimitive(prop_type)) {
        decorators.push(
          SrcApiQuery({
            ...params,
            name: prop,
            style: 'deepObject',
            explode: true,
            schema: ref(prop_type),
          }),
        );
      } else {
        decorators.push(
          SrcApiQuery({
            ...params,
            name: prop,
            type: prop_type,
          }),
        );
      }
    }
    return applyDecorators(...decorators);
  } else {
    // required = required === true; // required false by default
    return applyDecorators(
      SrcApiQuery({
        ...options as BaseApiQueryOptions,
      }),
      // FixQueryParam(),
    );
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

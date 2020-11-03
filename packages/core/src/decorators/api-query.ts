import { applyDecorators } from '@nestjs/common';
import { ApiQuery as SrcApiQuery, ApiQueryOptions as BaseApiQueryOptions } from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import {
  MediaTypeObject,
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ref } from '../model';
import apply = Reflect.apply;

declare type ApiQueryOptions =
  | (BaseApiQueryOptions & { name: string; schema: SchemaObject | ReferenceObject; type?: undefined })
  | (Omit<BaseApiQueryOptions, 'name' | 'schema'> & { name?: undefined; schema?: undefined; type: new () => any });

export function ApiQuery(options: ApiQueryOptions): MethodDecorator {
  let { required, name, schema, type, ...params } = options;
  if (name === undefined) {
    const instance = new type();
    const decorators = [];
    for (const prop in instance) {
      // console.log(prop);
      // const decorator = Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, instance, prop);
      // console.log(prop, ref(instance[prop].constructor));
      // if (decorator && !isPrimitive(decorator.type)) {
      if (instance[prop].constructor && !isPrimitive(instance[prop].constructor)) {
        decorators.push(
          ApiQuery({
            ...params,
            name: prop,
            schema: ref(instance[prop].constructor),
          }),
        );
      }
    }
    return applyDecorators(...decorators);
  } else {
    required = required === true; // required false by default
    const content = schema ? { 'application/json': { schema } } : undefined;
    return applyDecorators(
      SrcApiQuery({
        ...params,
        name,
        required,
        content,
        // schema: schema as SchemaObject,
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

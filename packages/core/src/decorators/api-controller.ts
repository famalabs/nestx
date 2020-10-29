import { ApiTags } from '@nestjs/swagger';
import { applyDecorators, Controller, SerializeOptions } from '@nestjs/common';
import { ClassTransformOptions } from 'class-transformer';

export function ApiController(name: string, options?: ClassTransformOptions): ClassDecorator {
  options = options || {};
  if (options.excludePrefixes === undefined) {
    options.excludePrefixes = ['__'];
  }
  return applyDecorators(
    Controller(name),
    ApiTags(name),
    SerializeOptions(options),
    // @UseInterceptors(ClassSerializerInterceptor)
  );
}

import { ApiOkResponse, ApiResponseMetadata } from '@nestjs/swagger';
import { applyDecorators, HttpCode } from '@nestjs/common';
import { DECORATORS } from '../constants';
import { BaseModel } from '../model';

export interface ModelResponseMetadata extends ApiResponseMetadata {
  type: typeof BaseModel;
}

export function ModelResponse(metadata: ModelResponseMetadata): MethodDecorator {
  return (target: any, key: PropertyKey, descriptor: PropertyDescriptor): PropertyDescriptor => {
    Reflect.defineMetadata(DECORATORS.MODEL_RESPONSE, metadata, descriptor.value);
    return descriptor;
  };
}

export function ApiModelResponse(metadata: ModelResponseMetadata): MethodDecorator {
  const status = (metadata.status = Number(metadata.status) || 200);
  return applyDecorators(
    ModelResponse(metadata),
    ApiOkResponse(metadata),
    HttpCode(status), // override POST 201
  );
}

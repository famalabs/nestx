import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, ValidateNested, ValidationOptions } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export type ApiModelPropertyParameter = Parameters<typeof ApiProperty>[0];

export interface ApiModelPropertyType extends ApiModelPropertyParameter {
  type: new (...args) => any;
}

const example_date = new Date().toISOString();

export function DateStringProperty(metadata?: ApiModelPropertyParameter, validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    ApiProperty({ type: String, example: example_date, ...metadata }),
    IsDate(validationOptions),
    Type(() => Date) as PropertyDecorator,
    Transform((value: Date) => value && value.toISOString(), { toPlainOnly: true }) as PropertyDecorator,
  );
}

export function ArrayProperty(metadata: ApiModelPropertyType, validationOptions?: ValidationOptions): PropertyDecorator {
  const { type } = metadata;
  return applyDecorators(
    ApiProperty({ isArray: true, ...metadata }),
    IsArray(),
    Type(() => type) as PropertyDecorator,
    ValidateNested({ each: true, ...validationOptions }),
    // Transform((value) => (value instanceof Array ? value : [value]).map(e => new type(e))),
  );
}

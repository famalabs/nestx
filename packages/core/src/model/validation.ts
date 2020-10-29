import { IsOptional, ValidateIf, ValidationOptions } from 'class-validator';

export function AllowUndefined(validationOptions?: ValidationOptions) {
  return ValidateIf((obj, value) => {
    return value !== undefined;
  }, validationOptions);
}

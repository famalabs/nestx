import { IsOptional, IsString } from 'class-validator';

export class ItemFilter<T> {
  @IsString()
  @IsOptional()
  fields?: string; // select

  @IsOptional()
  // @Type(() => Include)
  // include?: Include<T>;
  // @IsArray()
  // @ValidateNested({ each: true })
  // error if array Include<T>[]
  @IsString()
  include?: string; // populate
}

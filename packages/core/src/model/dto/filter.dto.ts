import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Where } from './where.dto';

export class Filter<T> {
  @IsOptional()
  @Type(() => Where)
  @Transform(value => new Where(value))
  where?: Where<T>;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  skip?: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  sort?: string;

  @IsString()
  @IsOptional()
  fields?: string; // select

  @IsOptional()
  @IsString()
  include?: string; // populate
}

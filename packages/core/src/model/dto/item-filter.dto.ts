import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ItemFilter<T> {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fields?: string; // select

  @ApiPropertyOptional()
  @IsOptional()
  // @Type(() => Include)
  // include?: Include<T>;
  // @IsArray()
  // @ValidateNested({ each: true })
  // error if array Include<T>[]
  @IsString()
  include?: string; // populate
}

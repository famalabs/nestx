import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { plainToClass, Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Where } from './where.dto';

export class ListFilter {
  @ApiPropertyOptional()
  @IsOptional()
  where?: Where;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  skip?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fields?: string; // select

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  include?: string; // populate
}

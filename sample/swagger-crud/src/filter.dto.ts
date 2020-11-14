import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {ApiPropertyOptional} from "@nestjs/swagger";

export class Filter {
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

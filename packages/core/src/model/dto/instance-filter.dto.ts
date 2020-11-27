import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class InstanceFilter {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fields?: string; // select

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  include?: string; // populate
}

import { IsOptional } from 'class-validator';
import { plainToClass, Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Where } from './where.dto';

export class CountFilter {
  @ApiPropertyOptional()
  @IsOptional()
  where?: Where;
}

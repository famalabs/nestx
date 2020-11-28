import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Where } from './where.dto';
import { ParseString } from '../../decorators';

export class CountFilter {
  @ApiPropertyOptional()
  @ParseString(() => Where)
  @IsOptional()
  where?: Where;
}

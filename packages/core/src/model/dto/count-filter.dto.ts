import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Where } from './where.dto';
import { JSONParse } from '../../decorators';

export class CountFilter {
  @ApiPropertyOptional()
  @JSONParse(() => Where)
  @IsOptional()
  where?: Where;
}

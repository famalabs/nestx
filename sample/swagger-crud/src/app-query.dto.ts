import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Where } from '@famalabs/nestx-core';

export class AppQuery extends Where {
  @ApiPropertyOptional()
  @Type(() => Number)
  test: number;
}

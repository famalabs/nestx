import { Filter } from '@famalabs/nestx-core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AppQuery } from './app-query.dto';

export class AppFilter extends Filter<AppQuery> {
  @ApiPropertyOptional({ type: AppQuery })
  @IsOptional()
  @Type(() => AppQuery)
  @Transform(value => new AppQuery(value))
  where?: AppQuery;
}

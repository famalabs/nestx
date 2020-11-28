import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { AppQuery } from './app-query.dto';
import { ListFilter, JSONParse } from '@famalabs/nestx-core';

export class AppFilter extends ListFilter {
  @ApiPropertyOptional({ type: AppQuery })
  @JSONParse(() => AppQuery)
  @IsOptional()
  where?: AppQuery;
}

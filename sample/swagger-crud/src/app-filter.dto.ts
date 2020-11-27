import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { AppQuery } from './app-query.dto';
import { ListFilter, ParseString } from '@famalabs/nestx-core';

export class AppFilter extends ListFilter {
  @ApiPropertyOptional({ type: AppQuery })
  @ParseString(() => AppQuery)
  @IsOptional()
  where?: AppQuery;
}

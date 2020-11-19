import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AppQuery {
  @ApiPropertyOptional()
  @Type(() => Number)
  test: number;

  constructor(obj: Partial<AppQuery>) {
    Object.assign(this, obj);
  }
}

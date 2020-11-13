import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class NotificationTokenDto {
  @ApiProperty({ required: true })
  @IsString()
  value!: string;
}

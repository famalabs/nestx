import { IRefreshToken } from './../interfaces/refresh-token.interface';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto implements IRefreshToken {
  id?: string;

  @ApiProperty({ required: true })
  value!: string;

  @ApiProperty({ required: true })
  userId!: string;

  @ApiProperty({ required: true })
  expiresAt: Date;

}

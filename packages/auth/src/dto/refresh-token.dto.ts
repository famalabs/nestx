import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export type GrantType = 'refresh_token';
export class RefreshTokenDto {
  @ApiProperty({ required: true })
  @IsString()
  refreshToken!: string;

  @ApiProperty({ required: true })
  @IsString()
  grantType!: GrantType;
}

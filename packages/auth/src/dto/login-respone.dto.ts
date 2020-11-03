import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsOptional, IsString } from 'class-validator';
import { ILoginResponse } from './../interfaces/login-response.interface';

export class LoginResponseDto implements ILoginResponse {
  @ApiProperty()
  @IsString()
  accessToken: string;

  @ApiProperty({ default: 'Bearer' })
  @IsOptional()
  @IsString()
  tokenType?: string = 'Bearer';

  @ApiProperty()
  @IsDefined()
  expiresIn: string | number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

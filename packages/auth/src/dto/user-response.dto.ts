import { ApiProperty } from '@nestjs/swagger';
import { IUserResponse } from '../interfaces';

export class UserResponseDto implements IUserResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  email?: string;
  @ApiProperty()
  isVerified?: boolean;
  @ApiProperty()
  socialProvider?: string;
}

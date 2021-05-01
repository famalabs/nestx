import { IsEmail, IsIP, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ILogin } from '../interfaces/login.interface';

export class LoginDto implements ILogin {
  @ApiProperty({ example: 'user@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'myPassword' })
  @IsString()
  password: string;
}

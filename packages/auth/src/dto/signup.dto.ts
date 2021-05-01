import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ISignup } from './../interfaces/signup.interface';

export class SignupDto implements ISignup {
  @ApiProperty({ example: 'user@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'myPassword' })
  @IsString()
  password: string;
}

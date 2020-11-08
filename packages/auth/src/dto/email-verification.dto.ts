import { ObjectID } from 'mongodb';
import { ApiProperty } from '@nestjs/swagger';
import { IEmailVerification } from './../interfaces/email-verification.interface';
import { IsDateString, IsEmail, IsIP, IsString } from 'class-validator';

export class EmailVerificationDto implements IEmailVerification {
  _id?: string;

  @ApiProperty({ required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  emailToken: string;

  @ApiProperty({ required: true })
  @IsDateString()
  timestamp: Date;
}

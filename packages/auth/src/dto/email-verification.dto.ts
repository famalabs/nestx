// import { ObjectID } from 'mongodb';
// import { ApiProperty } from '@nestjs/swagger';
// import { IEmailVerification } from './../interfaces/email-verification.interface';
// import { IsDateString, IsEmail, IsIP, IsString } from 'class-validator';

// export class EmailVerificationDto extends BaseModelDto
//   implements IEmailVerification {
//   @ApiProperty({ required: true })
//   @IsString()
//   _id!: string;

//   @ApiProperty({ required: true })
//   @IsEmail()
//   email: String;

//   @ApiProperty({ required: true })
//   @IsString()
//   emailToken: String;

//   @ApiProperty({ required: true })
//   @IsString()
//   userId!: ObjectID | string;

//   @ApiProperty({ required: true })
//   @IsDateString()
//   timestamp: Date;

//   @ApiProperty({ required: true })
//   @IsString()
//   clientId!: string;

//   @ApiProperty({ required: true })
//   @IsIP()
//   ipAddress!: string;
// }
// // TODO CLASSE MAI USATA

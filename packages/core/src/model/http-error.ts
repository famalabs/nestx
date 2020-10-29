import { HttpException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class HttpError extends HttpException {
  @ApiProperty({example: 400})
  statusCode: number;
  @ApiProperty({required: false})
  error: string;
  @ApiProperty({required: false})
  message: string;
}

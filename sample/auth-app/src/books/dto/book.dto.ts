import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IBook } from '../interfaces/book.interface';

export class BookDto implements IBook {
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsString()
  user: string;
}

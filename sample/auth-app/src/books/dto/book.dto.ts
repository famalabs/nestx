import { ApiProperty } from '@nestjs/swagger';
import { Ref } from '@typegoose/typegoose';
import { IsString } from 'class-validator';
import { User } from '../../users/user.model';
import { IBook } from '../interfaces/book.interface';

export class BookDto implements IBook {
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsString()
  user: Ref<User>;
}

import { Controller, Post, Body, Get, Param, UseGuards, Query } from '@nestjs/common';
import { BookDto } from './dto/book.dto';
import { IBook } from './interfaces/book.interface';
import { BooksService } from './books.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ACLGuard, ACL, JwtGuard, ROLE, ReqInstanceData } from '@famalabs/nestx-auth';
import { Filter, ItemFilter, ref, Where } from '@famalabs/nestx-core';
import { Book } from './models/book.model';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ACL(ROLE.ANY)
  async create(@Body() data: BookDto) {
    this.booksService.create(data);
  }

  @Get()
  @ApiQuery({ name: 'where', schema: ref(Where) })
  async find(@Query() filter: Filter<Book>): Promise<IBook[]> {
    return this.booksService.find(filter);
  }

  @Get(':id')
  @ACL(ROLE.OWNER)
  @ApiBearerAuth()
  @UseGuards(JwtGuard, ACLGuard)
  findOne(@Param('id') id: string, @ReqInstanceData() instance: BookDto, filter: ItemFilter<Book>) {
    return instance;
  }
}

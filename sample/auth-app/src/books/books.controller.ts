import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BookDto } from './dto/book.dto';
import { BooksService } from './books.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ACL, GRANT, ReqInstanceData } from '@famalabs/nestx-auth';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiBearerAuth()
  @ACL(GRANT.AUTHENTICATED)
  async create(@Body() data: BookDto) {
    this.booksService.create(data);
  }

  @Get(':id')
  @ACL(GRANT.OWNER)
  @ApiBearerAuth()
  findOne(@Param('id') id: string, @ReqInstanceData() instance: BookDto) {
    return instance;
  }
}

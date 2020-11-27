import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExtraModels, ApiQuery } from '@nestjs/swagger';
import {
  ref,
  ApiQuery as CustomApiQuery,
  Filter,
  Where,
} from '@famalabs/nestx-core';
import { AppFilter } from './app-filter.dto';
import { AppQuery } from './app-query.dto';
import { ListFilter, CountFilter, InstanceFilter } from '@famalabs/nestx-core';

// @ApiExtraModels(Where)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test1')
  // @ApiQuery({ style: 'deepObject', explode: true, name: 'where', schema: ref(AppQuery) })
  test1(@Query() filter: AppFilter) {
    console.log(filter);
    return filter;
  }

  @Post('test1')
  test1post(@Body() body: AppFilter) {
    console.log(body);
    return body;
  }

  @Get('test2')
  @CustomApiQuery({ type: AppFilter })
  test2(
    @Query(
      new ValidationPipe({
        transform: true,
        validateCustomDecorators: true,
        transformOptions: { enableImplicitConversion: true },
        expectedType: AppFilter,
      }),
    )
    filter,
  ) {
    console.log(filter);
    return filter;
  }

  @Get('test2/count')
  @CustomApiQuery({ name: 'where', type: AppQuery, required: false })
  count(@Query('where') where) {
    console.log(where);
    return where;
  }

  @Get('test2/:id')
  @CustomApiQuery({ type: InstanceFilter })
  async findById(@Param('id') id: string, @Query() filter) {
    console.log(filter);
    return filter;
  }
}

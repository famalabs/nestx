import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExtraModels, ApiQuery } from '@nestjs/swagger';
import { ref, ApiQuery as CustomApiQuery, Filter } from '@famalabs/nestx-core';
import { AppFilter } from './app-filter.dto';
import { AppQuery } from './app-query.dto';

@ApiExtraModels(AppFilter, Filter)
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
  @ApiQuery({ style: 'deepObject', explode: true, schema: ref(AppFilter) })
  // @ApiQuery({style: 'deepObject', explode: true, name: 'where', schema: ref(AppQuery)})
  test2(@Query() filter: AppFilter) {
    console.log(filter);
    return filter;
  }

  @Get('test2a')
  @CustomApiQuery({ type: AppFilter })
  test2a(@Query() filter: AppFilter) {
    console.log(filter);
    return filter;
  }

  @Get('test2b')
  @CustomApiQuery({ type: AppFilter })
  test2b(
    @Query(new ValidationPipe({ transform: true, expectedType: AppFilter }))
    filter,
  ) {
    // test2b(@Query() filter) {
    console.log(filter);
    return filter;
  }

  @Get('test2c')
  test2c(@Query() filter: Filter<AppQuery>) {
    console.log(filter);
    return filter;
  }

  @Get('test2d')
  @CustomApiQuery({ type: Filter })
  test2d(
    @Query(new ValidationPipe({ transform: true, expectedType: Filter }))
    filter,
  ) {
    console.log(filter);
    return filter;
  }

  @Get('test3')
  @ApiQuery({
    name: 'where',
    content: { 'application/json': { schema: ref(AppQuery) } },
  })
  test3(@Query() filter: AppFilter) {
    console.log(filter);
    return filter;
  }
}

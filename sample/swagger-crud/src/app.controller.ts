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
import { ApiExtraModels, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  ApiQuery as CustomApiQuery,
  ListFilter,
  Where,
  CountFilter,
  InstanceFilter,
} from '@famalabs/nestx-core';
import { AppFilter, AppQuery } from './dto';

@ApiExtraModels(Where)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({ summary: 'show GET nested object not working' })
  @Get('test1')
  // @ApiQuery({ style: 'deepObject', explode: true, name: 'where', schema: ref(AppQuery) })
  test1(@Query() filter: AppFilter) {
    console.log(filter);
    return filter;
  }

  @ApiOperation({ summary: 'how nested object should work' })
  @Post('test1')
  test1post(@Body() body: AppFilter) {
    console.log(body);
    return body;
  }

  @ApiOperation({ summary: 'this works' })
  @Get('test2')
  @CustomApiQuery({ type: AppFilter })
  test2(
    @Query(
      new ValidationPipe({
        transform: true,
        expectedType: AppFilter,
      }),
    )
    filter,
  ) {
    console.log(filter);
    return filter;
  }

  @ApiOperation({ summary: 'this works' })
  @Get('test2/count')
  @CustomApiQuery({ name: 'where', type: AppQuery, required: false })
  test2count(@Query('where') where) {
    console.log(where);
    return where;
  }

  @Get('test3')
  @CustomApiQuery({ type: ListFilter })
  test3(
    @Query(
      new ValidationPipe({
        transform: true,
        expectedType: ListFilter,
      }),
    )
    filter,
  ) {
    console.log(filter);
    return filter;
  }

  @Get('test3/count')
  @CustomApiQuery({ type: CountFilter })
  test3count(
    @Query(
      new ValidationPipe({
        transform: true,
        expectedType: CountFilter,
      }),
    )
    filter,
  ) {
    console.log(filter);
    return filter.where;
  }
  // named property validation doesn't transform
  // test3count(@Query(
  //   'where',
  //   new ValidationPipe({
  //     transform: true,
  //     expectedType: Where,
  //   }),
  // ) where) {
  //   console.log(where);
  //   return where;
  // }

  @Get('test3/:id')
  @CustomApiQuery({ type: InstanceFilter })
  async findById(@Param('id') id: string, @Query() filter) {
    console.log(filter);
    return filter;
  }
}

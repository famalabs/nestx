import {Body, Controller, Get, Post, Query} from '@nestjs/common';
import { AppService } from './app.service';
import {ApiExtraModels, ApiQuery} from '@nestjs/swagger';
import {Filter, ref, ApiQuery as CustomApiQuery} from '@famalabs/nestx-core';
import {AppFilter} from "./app-filter.dto";
import {AppQuery} from "./app-query.dto";

@ApiExtraModels(AppFilter)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test1')
  test1(@Query() filter: AppFilter) {
    console.log(filter);
    return filter;
  }

  @Get('test2')
  @ApiQuery({style: 'deepObject', explode: true, name: 'filter', schema: ref(AppFilter)})
  // @ApiQuery({style: 'deepObject', explode: true, name: 'where', schema: ref(AppQuery)})
  test2(@Query() filter: AppFilter) {
    console.log(filter);
    return filter;
  }

  @Get('test3')
  @ApiQuery({content: { 'application/json': { schema: ref(AppFilter) } }})
  test3(@Query() filter: AppFilter) {
    console.log(filter);
    return filter;
  }

    @Get('test4')
    @CustomApiQuery({type: AppFilter})
    test4(@Query() filter: AppFilter) {
        console.log(filter);
        return filter;
    }

    @Post('test1')
    test1post(@Body() body: AppFilter) {
      console.log(body);
      return body;
    }
}

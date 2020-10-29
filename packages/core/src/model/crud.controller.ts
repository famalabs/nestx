import { Body, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { CrudService } from './crud.service';
import { ApiModelResponse } from '../decorators';
import { DocumentType } from '@typegoose/typegoose';
import { BaseModel, ref } from './base.model';
import { ApiExtraModels, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { Filter, ItemFilter, Where } from './dto';

export interface ICrudController<T extends BaseModel> {

  create(data: T): Promise<T>;

  find(filter: Filter<T>): Promise<T[]>;

  count(where: Where<T>): Promise<number>;

  findById(id: T['id'], filter: ItemFilter<T>): Promise<T>;

  updateById(id: T['id'], data: T): Promise<T>;

  deleteById(id: T['id']): Promise<boolean>;

}

export abstract class CrudController<T extends BaseModel> implements ICrudController<T> {

  protected constructor(protected readonly model: new(...args: any[]) => T, protected readonly service: CrudService<DocumentType<T>>) {
  }

  @Post()
  @ApiModelResponse({ type: this.model })
  async create(@Body() data: T): Promise<T> {
    return this.service.create(data);
  }

  @Get()
  @ApiModelResponse({ type: this.model, isArray: true })
  async find(@Query() filter: Filter<T>): Promise<T[]> {
    return this.service.find(filter);
  }

  @Get('count')
  @ApiQuery({ name: 'where', required: false, schema: ref(Where) })
  async count(@Query('where') where): Promise<number> {
    return this.service.count(where);
  }

  @Get('id/:id')
  @ApiModelResponse({ type: this.model })
  async findById(@Param('id') id: T['id'], @Query() filter: ItemFilter<T>): Promise<T> {
    return this.service.findById(id, filter);
  }

  @Patch('id/:id')
  @ApiModelResponse({ type: this.model })
  async updateById(@Param('id') id: T['id'], @Body() data: T): Promise<T> {
    return this.service.updateById(id, data);
  }

  @Delete('id/:id')
  @ApiOkResponse({ type: Boolean })
  async deleteById(@Param('id') id: T['id']): Promise<boolean> {
    return this.service.deleteById(id);
  }

}

import { Model, Document } from 'mongoose';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Filter, ItemFilter, Where } from './dto';

export type IDType = any | string | number;

export interface ICrudService<T> {

  find(filter: Filter<T>): Promise<T[]>;

  findOne(where: Where<T>): Promise<T>;

  findById(id: IDType): Promise<T>;

  count(where: Where<T>): Promise<number>;

  create(data: any): Promise<T>;

  update(where: Where<T>, data: any): Promise<T[]>;

  updateById(id: IDType, data: any): Promise<T>;

  replaceById(id: IDType, data: any): Promise<T>;

  delete(where: Where<T>): Promise<number>;

  deleteById(id: IDType): Promise<boolean>;

}

export class CrudService<T extends Document> implements ICrudService<T> {

  constructor(protected model: Model<T>) {
  }

  async find(filter?: Filter<T>): Promise<T[]> {
    console.log('Crud', this.constructor.name, 'find', filter);
    let op = this.model.find();
    op = applyFilter(op, filter);
    return op.exec();
  }

  async findOne(where: Where<T>, filter?: ItemFilter<T>): Promise<T> {
    console.log('Crud', this.constructor.name, 'findOne', where, filter);
    let op = this.model.findOne(where);
    op = applyFilter(op, filter);
    return op.exec();
  }

  async findById(id: IDType, filter?: ItemFilter<T>): Promise<T> {
    console.log('Crud', this.constructor.name, 'findById', id, filter);
    let op = this.model.findById(id);
    op = applyFilter(op, filter);
    return op.exec()
      .then(res => {
        if (res === null) {
          throw new NotFoundException();
        }
        return res;
      })
      .catch(err => {
        throw new NotFoundException();
      });
  }

  async count(where: Where<T>): Promise<number> {
    console.log('Crud', this.constructor.name, 'count', where);
    return this.model.countDocuments(where).exec();
  }

  async create(data): Promise<T> {
    console.log('Crud', this.constructor.name, 'create', data);
    const doc = new this.model(data);
    return doc.save()
      .catch(err => {
        throw new UnprocessableEntityException(err.message);
      });
  }

  async update(where: Where<T>, data): Promise<T[]> {
    console.log('Crud', this.constructor.name, 'update', where, data);
    await this.model.updateMany(where, data).exec();
    return this.model.find().where(where).exec();
  }

  async updateById(id: IDType, data): Promise<T> {
    console.log('Crud', this.constructor.name, 'updateById', id, data);
    const doc = await this.findById(id);
    Object.assign(doc, data);
    return doc.save()
      .catch(err => {
        throw new UnprocessableEntityException(err.message);
      });
  }

  async replaceById(id: IDType, data): Promise<T> {
    console.log('Crud', this.constructor.name, 'replaceById', id, data);
    return this.model.findByIdAndUpdate(id, data, {
      new: true,
    }).exec()
      .catch(err => {
        throw new NotFoundException();
      });
  }

  async delete(where: Where<T>): Promise<number> {
    console.log('Crud', this.constructor.name, 'delete', where);
    return this.model.remove(where).exec()
      .then(res => res.deletedCount);
  }

  async deleteById(id: IDType): Promise<boolean> {
    console.log('Crud', this.constructor.name, 'deleteById', id);
    return this.model.findByIdAndRemove(id).exec()
      .then(res => !!res)
      .catch(err => {
        throw new NotFoundException();
      });
  }
}

function applyFilter(op, filter) {
  if (!filter) {
    return op;
  }
  const { where, fields, skip, limit, sort, include } = filter;
  if (include) {
    op = op.populate(include);
  }
  if (where) {
    op = op.where(where);
  }
  if (fields) {
    op = op.select(fields);
  }
  if (sort) {
    op = op.sort(sort);
  }
  if (skip) {
    op = op.skip(skip);
  }
  if (limit) {
    op = op.limit(limit);
  }
  return op;
}

function update<T>(doc, data): T {
  return Object.assign(doc, data);
}

import { CreateQuery, FilterQuery, QueryFindOneAndUpdateOptions, Types, UpdateQuery } from 'mongoose';
import { MongoError } from 'mongodb';
import { BaseModel } from '../models/base.model';
import { InternalServerErrorException } from '@nestjs/common';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';

export abstract class BaseService<T extends BaseModel> {
  protected model: ReturnModelType<AnyParamConstructor<T>>;

  protected constructor(model: ReturnModelType<AnyParamConstructor<T>>) {
    this.model = model;
  }

  protected static throwMongoError(err: MongoError): void {
    throw new MongoError(err);
  }

  protected static toObjectId(id: string): Types.ObjectId {
    try {
      return Types.ObjectId(id);
    } catch (e) {
      this.throwMongoError(e);
    }
  }

  async findAll(filter = {}): Promise<Array<DocumentType<T>>> {
    try {
      return await this.model.find(filter).exec();
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  async findOne(filter = {}): Promise<DocumentType<T>> {
    try {
      return await this.model.findOne(filter).exec();
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  async findOneAndUpdate(conditions = {}, update = {}, options = {}): Promise<DocumentType<T>> {
    try {
      return await this.model.findOneAndUpdate(conditions, update, options).exec();
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  async findById(id: string): Promise<DocumentType<T>> {
    try {
      return await this.model.findById(BaseService.toObjectId(id)).exec();
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  async create(item: CreateQuery<T>): Promise<DocumentType<T>> {
    try {
      return await this.model.create(item);
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  async deleteById(id: string): Promise<DocumentType<T>> {
    try {
      return await this.model.findByIdAndDelete(BaseService.toObjectId(id)).exec();
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  async delete(filter = {}): Promise<DocumentType<T>> {
    try {
      return await this.model.findOneAndDelete(filter).exec();
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  async update(item: T): Promise<DocumentType<T>> {
    try {
      return await this.model
        .findByIdAndUpdate(BaseService.toObjectId(item._id), { $set: item } as any, {
          new: true,
        })
        .exec();
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }
}

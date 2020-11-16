import { Schema } from 'mongoose';
import { buildSchema, prop } from '@typegoose/typegoose';

export abstract class BaseModel {
  @prop()
  createdDate?: Date;
  @prop()
  updatedDate?: Date;
  _id: string;
  static get schema(): Schema {
    return buildSchema(this as any, {
      timestamps: true,
      toJSON: {
        getters: true,
        virtuals: true,
      },
    });
  }
  static get modelName(): string {
    return this.name;
  }
  get id(): string {
    return this._id;
  }
}

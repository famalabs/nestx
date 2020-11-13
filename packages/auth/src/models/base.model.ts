import { ApiProperty } from '@nestjs/swagger';
import { buildSchema, prop } from '@typegoose/typegoose';
import { Schema } from 'mongoose';

export interface IBaseModel {
  createdAt?: Date;
  updatedAt?: Date;
  _id: string;
}

export class BaseModel implements IBaseModel {
  @ApiProperty({ type: Date })
  @prop()
  createdAt?: Date;
  @ApiProperty({ type: Date })
  @prop()
  updatedAt?: Date;
  @ApiProperty({ type: String })
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

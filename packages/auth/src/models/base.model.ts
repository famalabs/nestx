import { ApiProperty } from '@nestjs/swagger';
import { buildSchema, modelOptions, prop } from '@typegoose/typegoose';
import { Schema } from 'mongoose';

export interface IBaseModel {
  createdAt?: Date;
  updatedAt?: Date;
  _id?: string;
}

export class BaseModel implements IBaseModel {
  @ApiProperty({ type: Date })
  @prop()
  createdAt?: Date; // provided by schemaOptions.timestamps
  @ApiProperty({ type: Date })
  @prop()
  updatedAt?: Date; // provided by schemaOptions.timestamps
  @ApiProperty({ type: String })
  _id?: string; // _id getter as string

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
}

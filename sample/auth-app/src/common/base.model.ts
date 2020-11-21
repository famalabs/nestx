import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { modelOptions } from '@typegoose/typegoose';
import { Expose, Exclude } from 'class-transformer/decorators';

export interface IBaseModel {
  createdAt?: Date;
  updatedAt?: Date;
  id: string;
}
export type IDType = any | string | number;

@modelOptions({ schemaOptions: { timestamps: true } })
export class BaseModel {
  @ApiProperty({ type: String })
  @Expose()
  public get id() {
    return this._id && this._id.toString();
  }

  public set id(value) {
    this._id = value;
  }

  @ApiHideProperty()
  @Exclude()
  _id: IDType;

  @ApiProperty({ type: Date })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  updatedAt?: Date;
}

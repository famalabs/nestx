import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { buildSchema, modelOptions, prop } from '@typegoose/typegoose';
import { Expose, Exclude } from 'class-transformer/decorators';
import { Schema } from 'mongoose';

export interface IBaseModel {
  createdAt?: Date;
  updatedAt?: Date;
  id: string;
}
export type IDType = any | string | number;

// export class BaseModel implements IBaseModel {
//   @ApiProperty({ type: Date })
//   @prop()
//   createdAt?: Date;
//   @ApiProperty({ type: Date })
//   @prop()
//   updatedAt?: Date;
//   @ApiProperty({ type: String })
//   @ApiHideProperty()
//   @Exclude()
//   _id: IDType;

//   @ApiProperty({ type: String })
//   @Expose()
//   public get id(): string {
//     return this._id && this._id.toString();
//   }

//   public set id(value) {
//     this._id = value;
//   }

//   static get schema(): Schema {
//     return buildSchema(this as any, {
//       timestamps: true,
//       toJSON: {
//         getters: true,
//         virtuals: true,
//       },
//     });
//   }
//   static get modelName(): string {
//     return this.name;
//   }
// }

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

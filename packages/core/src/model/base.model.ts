import { modelOptions, prop } from '@typegoose/typegoose';
import { ApiHideProperty, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsMongoId } from 'class-validator';
import { IDType } from './crud.service';

@modelOptions({ schemaOptions: { timestamps: true } })
export class BaseModel {
  // @ApiProperty({ type: 'string', required: false })
  // id: string | any;
  //
  // @ApiHideProperty()
  // @Expose({ name: 'id', toPlainOnly: true })
  // @Transform(value => value && value.toString())
  //   // tslint:disable-next-line:variable-name
  // _id: any;

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

  constructor(partial: object) {
    Object.assign(this, partial);
  }
}

// return is ReferenceObject
export function ref(model: string | Function): any {
  return { $ref: getSchemaPath(model) };
}

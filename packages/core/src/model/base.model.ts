import { modelOptions, prop } from '@typegoose/typegoose';
import { ApiHideProperty, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IDType } from './crud.service';

@modelOptions({ schemaOptions: { timestamps: true } })
export class BaseModel {
  @ApiProperty({ type: String })
  @Expose({ toPlainOnly: true })
  public get id() {
    return this._id && this._id.toString();
  }

  public set id(value) {
    this._id = value;
  }

  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  _id: IDType;

  constructor(partial: object) {
    Object.assign(this, partial);
  }
}

// return is ReferenceObject
export function ref(model: string | Function): any {
  return { $ref: getSchemaPath(model) };
}

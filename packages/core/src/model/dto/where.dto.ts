import { ApiProperty } from '@nestjs/swagger';
import { SerializeOptions, ValidationPipe } from '@nestjs/common';

export class Where<T> {
  // @ApiProperty({
  //   type: 'array',
  //   items: {
  //     anyOf: [
  //       'string',
  //       'number',
  //       'object'
  //     ]
  //   }
  // })
  constructor(partial: any) {
    Object.assign(this, partial);
  }
}

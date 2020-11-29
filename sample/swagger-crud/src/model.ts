import { classToPlain, plainToClass } from 'class-transformer';
import { BaseModel } from '@famalabs/nestx-core';

const test = {
  roles: ['ADMIN'],
  access: 0,
  _id: '5e3bea9470970f340cb08d73',
  email: 'admin@famalabs.com',
};

const c = plainToClass(BaseModel, test);
console.log('class', c, 'id:', c.id);
const p = classToPlain(c);
console.log('plain', p);
console.assert(
  test._id.toString() === p.id,
  'original _id and plain.id must be the same',
);

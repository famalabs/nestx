import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
// import { Filter, Where } from '../model';
import { DECORATORS } from '@nestjs/swagger/dist/constants';

export class QueryParsePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { type, metatype, data } = metadata;
    console.log(type, metatype, value, typeof value, data);
    if (type === 'query' && typeof value === 'string') {
      if (!isType(metatype, String)) {
        console.log('query parse string', metatype, value);
        // return new metatype(JSON.parse(value));
        return JSON.parse(value);
      }
    }
    if (type === 'query' && typeof value === 'object') {
      const instance = new metatype();
      for (const prop in value) {
        const decorator = Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, instance, prop);
        if (decorator && !isType(decorator.type, String) && typeof value[prop] === 'string') {
          console.log('query parse string', metatype, prop, decorator.type, value[prop]);
          value[prop] = JSON.parse(value[prop]);
        }
      }
    }
    return value;
  }
}

function isType(x, type) {
  return x === type || x instanceof type; // || (x() === type);
}

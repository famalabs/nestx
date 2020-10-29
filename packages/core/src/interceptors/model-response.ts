import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DECORATORS } from '../constants';
import { toModel } from '../functions';

export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const modelResponse = Reflect.getMetadata(DECORATORS.MODEL_RESPONSE, handler);
    const type = modelResponse && modelResponse.type;
    if (!type) {
      return next.handle();
    } else {
      return next
        .handle()
        .pipe(
          map((data) => toModel(type, data)),
        );
    }
  }
}

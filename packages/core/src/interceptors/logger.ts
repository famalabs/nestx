import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // console.log(context);
    const target = `${context.getClass().name}.${context.getHandler().name}`;
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        console.log(target, `[${Date.now() - now}ms]`);
      }),
      catchError(err => {
        console.error(target, err.status, err.message, `[${Date.now() - now}ms]`);
        return throwError(err);
      }),
    );
  }
}

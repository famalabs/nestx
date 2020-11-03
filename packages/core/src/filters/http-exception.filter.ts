import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    console.log('FILTER', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

// @Catch()
// export class ErrorFilter implements ExceptionFilter {
//   catch(error: Error, host: ArgumentsHost) {
//     let response = host.switchToHttp().getResponse();
//     let status = (error instanceof HttpException) ? error.getStatus(): HttpStatus.INTERNAL_SERVER_ERROR;
//
//     if (status === HttpStatus.UNAUTHORIZED)
//       return response.status(status).render('views/401');
//     if (status === HttpStatus.NOT_FOUND)
//       return response.status(status).render('views/404');
//     if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
//       if (process.env.NODE_ENV === 'production') {
//         console.error(error.stack);
//         return response.status(status).render('views/500');
//       }
//       else {
//         let message = error.stack;
//         return response.status(status).send(message);
//       }
//     }
//   }
// }

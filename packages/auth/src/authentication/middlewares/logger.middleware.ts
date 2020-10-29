import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    try {
      var offuscateRequest = JSON.parse(JSON.stringify(req.body));
      if (offuscateRequest && offuscateRequest.password)
        offuscateRequest.password = '*******';
      if (offuscateRequest != {})
        console.log(
          new Date().toString() +
            ' - [Request] ' +
            req.originalUrl +
            ' - ' +
            JSON.stringify(offuscateRequest),
        );
    } catch (error) {}
    next();
  }
}

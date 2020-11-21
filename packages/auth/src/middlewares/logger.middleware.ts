import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: Function) {
    try {
      const offuscateRequest = JSON.parse(JSON.stringify(req.body));
      if (offuscateRequest && offuscateRequest.password) offuscateRequest.password = '*******';
      if (offuscateRequest != {})
        this.logger.log(
          '[Request] ' + '(' + req.method + ') ' + req.originalUrl + ' - ' + JSON.stringify(offuscateRequest),
        );
    } catch (error) {
      this.logger.error(error);
    }
    next();
  }
}

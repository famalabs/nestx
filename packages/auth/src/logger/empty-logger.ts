import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class EmptyLogger implements LoggerService {
  log(message: any, context?: string) {}
  error(message: any, trace?: string, context?: string) {}
  warn(message: any, context?: string) {}
  debug?(message: any, context?: string) {}
  verbose?(message: any, context?: string) {}
}

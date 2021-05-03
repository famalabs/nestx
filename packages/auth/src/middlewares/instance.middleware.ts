import { createParamDecorator, ExecutionContext, Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Response } from 'express';

export type Instance = { data: any; user: any };
export type InstanceExtractor = (id: string) => Promise<Instance>;

export const INSTANCE_EXTRACTOR = Symbol('INSTANCE_EXTRACTOR');

@Injectable()
export class InstanceMiddleware implements NestMiddleware {
  constructor(@Inject(INSTANCE_EXTRACTOR) private readonly instanceExtractor: InstanceExtractor) {}
  async use(req: any, res: Response, next: Function) {
    console.log('Request...');
    console.log(req.params.id);
    const resource = await this.instanceExtractor(req.params.id);
    req.instance = resource;
    next();
  }
}

export const ReqInstanceData = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.instance.data;
});

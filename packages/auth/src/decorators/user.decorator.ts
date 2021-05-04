import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IJwtSub } from '../interfaces';

export const User = createParamDecorator((data: IJwtSub, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

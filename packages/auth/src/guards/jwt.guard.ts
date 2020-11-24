import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common/interfaces/features/execution-context.interface';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // avoid double execution when more JwtGuard are applied when binding SuperGuard Globally
    if (request.user) return true;
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }
}

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class GoogleLinkGuard extends AuthGuard('google-link') {
  constructor() {
    super({
      accessType: 'offline',
    });
  }
  /**
   * Reference for getAuthenticationOptions
   * https://github.com/nestjs/passport/issues/322#issuecomment-642865500
   */
  getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions {
    const request = context.switchToHttp().getRequest();
    const nestx_token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    return {
      state: `nestx_token=${nestx_token}`,
    };
  }
}

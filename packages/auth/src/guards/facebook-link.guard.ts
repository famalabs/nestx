import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { AUTH_OPTIONS } from '../constants';
import { IAuthenticationModuleOptions } from '../interfaces';
@Injectable()
export class FacebookLinkGuard extends AuthGuard('facebook-link') {
  constructor(@Inject(AUTH_OPTIONS) private readonly options: IAuthenticationModuleOptions) {
    super();
  }
  /**
   * Reference for getAuthenticationOptions
   * https://github.com/nestjs/passport/issues/322#issuecomment-642865500
   */
  getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions {
    const request = context.switchToHttp().getRequest();
    const nestx_token = this.options.constants.jwt.tokenFromRequestExtractor(request);
    return {
      state: `nestx_token=${nestx_token}`,
    };
  }
}

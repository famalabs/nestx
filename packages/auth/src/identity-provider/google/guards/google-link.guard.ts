import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { AuthOptions } from '../../../interfaces/module/auth-options.interface';
import { AUTH_OPTIONS } from '../../../constants';
@Injectable()
export class GoogleLinkGuard extends AuthGuard('google-link') {
  constructor(@Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions) {
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

    const nestx_token = this._AuthOptions.constants.jwt.tokenFromRequestExtractor(request);
    return {
      state: `nestx_token=${nestx_token}`,
    };
  }
}

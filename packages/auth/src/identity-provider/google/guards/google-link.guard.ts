import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { AuthOptions } from '../../../interfaces';
import { AUTH_OPTIONS } from '../../../constants';
@Injectable()
export class GoogleLinkGuard extends AuthGuard('google-link') {
  constructor(@Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions) {
    super({
      accessType: 'offline',
    });
  }
  getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions {
    const request = context.switchToHttp().getRequest();

    const nestx_token = this._AuthOptions.constants.jwt.tokenFromRequestExtractor(request);
    return {
      state: `nestx_token=${nestx_token}`,
    };
  }
}

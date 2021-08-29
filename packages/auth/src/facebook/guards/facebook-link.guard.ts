import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { AuthOptions, JwtFromRequestFunction } from '../../interfaces/module/auth-options.interface';
import { AUTH_OPTIONS } from '../../constants';
import { ExtractJwt } from 'passport-jwt';
@Injectable()
export class FacebookLinkGuard extends AuthGuard('facebook-link') {
  tokenExtractor: JwtFromRequestFunction;

  constructor(@Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions) {
    super({ scope: ['public_profile', 'email'] });
    this.tokenExtractor =
      _AuthOptions.accessTokenConfig.tokenFromRequestExtractor || ExtractJwt.fromAuthHeaderAsBearerToken();
  }

  getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions {
    const request = context.switchToHttp().getRequest();
    const nestx_token = this.tokenExtractor(request);
    return {
      state: `nestx_token=${nestx_token}`,
    };
  }
}

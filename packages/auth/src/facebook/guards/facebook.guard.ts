import { Inject, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_OPTIONS } from '../../constants';
import { AuthOptions } from '../../interfaces';

/** This class is used to guard routes that handle Facebook login and signup.
 *  It uses FacebookStrategy.
 */

@Injectable()
export class FacebookGuard extends AuthGuard('facebook') {
  constructor(@Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions) {
    super({ scope: _AuthOptions.providers.facebook.scope || ['public_profile', 'email'] });
  }
}

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** This class is used to guard routes that handle Facebook login and signup.
 *  It uses FacebookStrategy.
 */

@Injectable()
export class FacebookGuard extends AuthGuard('facebook') {
  constructor() {
    super({ scope: ['public_profile', 'email'] });
  }
}

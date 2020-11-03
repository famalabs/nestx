import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** This class is used to guard routes that handle Google login and signup.
 *  It uses GoogleStrategy.
 */

@Injectable()
export class GoogleGuard extends AuthGuard('google') {}

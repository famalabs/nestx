import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import passport = require('passport');

@Injectable()
export class FacebookMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    passport.authenticate('facebook', { scope: ['public_profile', 'email'] });
    next();
  }
}

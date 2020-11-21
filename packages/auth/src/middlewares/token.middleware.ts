import { Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import * as passport from 'passport';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TokenMiddleware.name);

  async use(req: Request, res: Response, next: Function) {
    const token = req.get('authorization');
    this.logger.debug(`Start token middleware with ${token ? token : 'no token in header'}`);
    if (!token) {
      return next();
    }
    const passportFn = createPassportContext(req, res);
    const user = await passportFn('jwt', {}, (err, user, info, status) => this.handleRequest(err, user, info, status));
    req.user = user;
    return next();
  }

  handleRequest(err, user, info, status): any {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

const createPassportContext = (request, response) => (type, options, callback: Function) =>
  new Promise((resolve, reject) =>
    passport.authenticate(type, options, (err, user, info, status) => {
      try {
        request.authInfo = info;
        return resolve(callback(err, user, info, status));
      } catch (err) {
        reject(err);
      }
    })(request, response, err => (err ? reject(err) : resolve())),
  );

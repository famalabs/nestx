import { RequestHandler } from 'express';

export function loggerMiddleware(): RequestHandler {
  return function log(req, res, next) {
    const hasQuery = Object.keys(req.query).length > 0;
    const hasBody = !!req.body;
    console.log(new Date().toISOString(), req.method, req.path,
      hasQuery ? 'query:' : '', hasQuery ? req.query : '',
      hasBody ? 'body:' : '', hasBody ? req.body : '');
    next();
  };
}

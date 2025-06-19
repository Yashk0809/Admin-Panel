import { RequestHandler } from 'express';

export const wrapMiddleware = (middleware: (...args: any[]) => Promise<any>): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(middleware(req, res, next)).catch(next);
  };
};

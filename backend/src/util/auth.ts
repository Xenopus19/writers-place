import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';
import type { TokenUser } from '../routers/login.js';
import { AppError } from './appError.js';

declare module 'express-serve-static-core' {
  interface Request {
    tokenUser: TokenUser;
  }
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AppError(401, 'UNAUTHORIZED', 'Token missing'));
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as TokenUser;
    Object.assign(req, { tokenUser: payload });
  } catch {
    next(new AppError(401, 'UNAUTHORIZED', 'Invalid token'));
    return;
  }
  next();
};

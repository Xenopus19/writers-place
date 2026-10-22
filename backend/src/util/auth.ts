import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';
import type { TokenUser } from '../routers/login.js';

declare global {
  namespace Express {
    interface Request {
      tokenUser: TokenUser;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token missing' });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as TokenUser;
    Object.assign(req, { tokenUser: payload });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

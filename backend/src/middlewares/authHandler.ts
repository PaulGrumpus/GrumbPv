import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';
import dotenv from 'dotenv';
dotenv.config();

interface RequestWithUser extends Request {
  user: any;
}

export const authHandler = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  (req as RequestWithUser).user = decoded;
  next();
};

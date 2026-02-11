import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';
import dotenv from 'dotenv';
dotenv.config();

interface RequestWithUser extends Request {
  user: any;
}

/**
 * Middleware that checks if the user is authenticated
 * Use this for general authenticated routes
 */
export const authHandler = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  (req as RequestWithUser).user = decoded;
  next();
};

/**
 * Middleware that checks if the user has admin role
 * Use this for admin-only routes
 */
export const adminHandler = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { role?: string };
    
    if (decoded.role !== 'admin') {
      throw new AppError('Access denied. Admin role required.', 403, 'FORBIDDEN');
    }
    
    (req as RequestWithUser).user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
};

// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';

const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: 'Resource not found' });
};

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
};

export { notFoundHandler, errorHandler };
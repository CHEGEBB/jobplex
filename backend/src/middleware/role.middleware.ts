// src/middleware/role.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const isJobSeeker = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'jobseeker') {
    return next();
  }
  return res.status(403).json({ message: 'Requires job seeker role' });
};

export const isEmployer = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'employer') {
    return next();
  }
  return res.status(403).json({ message: 'Requires employer role' });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Requires admin role' });
};

export const isOwnerOrAdmin = (resourceOwnerId: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (req.user.role === 'admin' || req.user.id === parseInt(resourceOwnerId)) {
      return next();
    }
    
    return res.status(403).json({ message: 'Unauthorized: You must be the owner or an admin' });
  };
};
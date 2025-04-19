// src/middleware/role.middleware.ts
import { Request, Response, NextFunction } from 'express';

// Middleware to check if user is a jobseeker
export const isJobSeeker = (req: Request, res: Response, next: NextFunction) => {
  // Check if user object exists (should be set by verifyToken middleware)
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  console.log('User role check:', req.user.role);
  
  // Check if user role is jobseeker
  if (req.user.role !== 'jobseeker') {
    return res.status(403).json({ message: 'Access denied. Only job seekers can perform this action.' });
  }
  
  // User is a jobseeker, proceed to next middleware/controller
  next();
};

// Middleware to check if user is an employer
export const isEmployer = (req: Request, res: Response, next: NextFunction) => {
  // Check if user object exists
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Check if user role is employer
  if (req.user.role !== 'employer') {
    return res.status(403).json({ message: 'Access denied. Only employers can perform this action.' });
  }
  
  // User is an employer, proceed to next middleware/controller
  next();
};

// Middleware to check if user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check if user object exists
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Check if user role is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Only admins can perform this action.' });
  }
  
  // User is an admin, proceed to next middleware/controller
  next();
};
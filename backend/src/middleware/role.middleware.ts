import { Request, Response, NextFunction } from 'express';

// Debug middleware to log request details
export const logRequestDetails = (req: Request, res: Response, next: NextFunction) => {
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request User:', req.user);
  next();
};

// Middleware to check if user is a jobseeker
export const isJobSeeker = (req: Request, res: Response, next: NextFunction) => {
  console.log('isJobSeeker middleware - User:', req.user);
  
  // Check if user object exists (should be set by verifyToken middleware)
  if (!req.user) {
    console.log('Authentication required - No user object found');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  console.log('User role check for jobseeker:', req.user.role);
  
  // Check if user role is jobseeker
  if (req.user.role !== 'jobseeker') {
    console.log('Access denied - User is not a jobseeker');
    return res.status(403).json({ message: 'Access denied. Only job seekers can perform this action.' });
  }
  
  console.log('User verified as jobseeker');
  // User is a jobseeker, proceed to next middleware/controller
  next();
};

// Middleware to check if user is an employer
export const isEmployer = (req: Request, res: Response, next: NextFunction) => {
  console.log('isEmployer middleware - User:', req.user);
  
  // Check if user object exists
  if (!req.user) {
    console.log('Authentication required - No user object found');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  console.log('User role check for employer:', req.user.role);
  
  // Check if user role is employer
  if (req.user.role !== 'employer') {
    console.log('Access denied - User is not an employer');
    return res.status(403).json({ message: 'Access denied. Only employers can perform this action.' });
  }
  
  console.log('User verified as employer');
  // User is an employer, proceed to next middleware/controller
  next();
};

// Middleware to check if user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log('isAdmin middleware - User:', req.user);
  
  // Check if user object exists
  if (!req.user) {
    console.log('Authentication required - No user object found');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  console.log('User role check for admin:', req.user.role);
  
  // Check if user role is admin
  if (req.user.role !== 'admin') {
    console.log('Access denied - User is not an admin');
    return res.status(403).json({ message: 'Access denied. Only admins can perform this action.' });
  }
  
  console.log('User verified as admin');
  // User is an admin, proceed to next middleware/controller
  next();
};

// Middleware to check if user is an admin or the owner of the resource
export const isAdminOrResourceOwner = (req: Request, res: Response, next: NextFunction) => {
  console.log('isAdminOrResourceOwner middleware - User:', req.user);
  
  // Check if user object exists
  if (!req.user) {
    console.log('Authentication required - No user object found');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const isAdmin = req.user.role === 'admin';
  const isOwner = req.user.id === Number(req.params.id);
  
  console.log(`Admin check: ${isAdmin}, Owner check: ${isOwner}`);
  
  // Check if user is either an admin or the owner of the requested resource
  if (!isAdmin && !isOwner) {
    console.log('Access denied - User is neither admin nor resource owner');
    return res.status(403).json({ message: 'Access denied. You do not have permission to perform this action.' });
  }
  
  console.log('User verified as admin or resource owner');
  // User has permission, proceed to next middleware/controller
  next();
};
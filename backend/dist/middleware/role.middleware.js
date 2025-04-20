"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isEmployer = exports.isJobSeeker = void 0;
// Middleware to check if user is a jobseeker
const isJobSeeker = (req, res, next) => {
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
exports.isJobSeeker = isJobSeeker;
// Middleware to check if user is an employer
const isEmployer = (req, res, next) => {
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
exports.isEmployer = isEmployer;
// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
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
exports.isAdmin = isAdmin;

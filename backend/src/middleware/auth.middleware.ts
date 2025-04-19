// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db.config';

interface DecodedToken {
  id: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from authorization header or from request cookies
    const authHeader = req.headers.authorization;
    let token: string | undefined;
    
    if (authHeader) {
      // Format: "Bearer <token>"
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      } else {
        token = authHeader; // In case the "Bearer " prefix is missing
      }
    }
    
    // Log for debugging
    console.log('Auth header:', authHeader);
    console.log('Extracted token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Verify token
    const secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, secret) as DecodedToken;
    
    // Log for debugging
    console.log('Token verified, decoded user ID:', decoded.id);
    
    // Check if user exists in the database
    const userResult = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    return res.status(500).json({ message: 'Authentication failed' });
  }
};
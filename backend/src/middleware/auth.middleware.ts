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
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from authorization header
    const authHeader = req.headers.authorization;
    console.log('Auth header received:', authHeader);
    
    let token: string | undefined;
    
    if (authHeader) {
      // Format: "Bearer <token>"
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
        console.log('Bearer token found and extracted');
      } else if (authHeader.startsWith('ey')) {
        // If it starts with 'ey' it's likely a raw JWT token
        token = authHeader;
        console.log('Raw JWT token detected and extracted');
      } else {
        console.log('Auth header format not recognized');
        return res.status(401).json({ message: 'Invalid authorization header format' });
      }
    }
    
    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Check token format
    if (!token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/)) {
      console.log('Token format is invalid');
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    // Verify token
    const secret = process.env.JWT_SECRET || 'jGa2XvR7bP9cQzT5mWkE3sD8fLpH6yN4';
    console.log('Using JWT secret:', secret ? '[SECRET MASKED]' : 'Default fallback secret');
    
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, secret) as DecodedToken;
      console.log('Token verified successfully');
      console.log('Decoded token data:', {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        issuedAt: new Date(decoded.iat * 1000).toISOString(),
        expiration: new Date(decoded.exp * 1000).toISOString()
      });
      
      // Check token expiration
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        console.log('Token has expired');
        return res.status(401).json({ message: 'Token expired' });
      }
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      if (verifyError instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (verifyError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Token verification failed' });
    }
    
    // Check if user exists in the database
    console.log('Checking if user exists in database with ID:', decoded.id);
    const userResult = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.id]);
    
    if (userResult.rows.length === 0) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('User found in database:', userResult.rows[0]);
    
    // Verify that the role in the token matches the role in the database
    const dbRole = userResult.rows[0].role;
    if (decoded.role !== dbRole) {
      console.log('Role mismatch between token and database');
      console.log('Token role:', decoded.role);
      console.log('Database role:', dbRole);
      
      // Use the database role instead of failing
      console.log('Using database role instead of token role');
      decoded.role = dbRole;
    }
    
    // Attach user info to request - using db values to ensure accuracy
    req.user = {
      id: userResult.rows[0].id,
      email: userResult.rows[0].email,
      role: userResult.rows[0].role
    };
    
    console.log('User authentication successful with role:', req.user.role);
    console.log('Proceeding to next middleware');
    
    next();
  } catch (error) {
    console.error('Auth middleware unexpected error:', error);
    return res.status(500).json({ message: 'Authentication failed due to server error' });
  }
};
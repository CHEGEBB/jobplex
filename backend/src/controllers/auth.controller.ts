// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../config/db.config';
import { LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../types/auth.types';

// Load environment variables to ensure they're available
dotenv.config();

// Get JWT configuration with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here';
// Define the JWT expiration value properly typed for SignOptions
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role, firstName, lastName }: RegisterRequest = req.body;
  
  // Validate input
  if (!email || !password || !role || !['jobseeker', 'employer'].includes(role)) {
    res.status(400).json({ message: 'Invalid input data' });
    return;
  }

  try {
    // Check if user already exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      res.status(409).json({ message: 'User already exists with this email' });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with transaction to ensure atomicity
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert user
      const userResult = await client.query(
        'INSERT INTO users (email, password, role, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, first_name, last_name',
        [email, hashedPassword, role, firstName, lastName]
      );
      
      const user = userResult.rows[0];
      
      // Create respective profile based on role
      if (role === 'jobseeker') {
        await client.query(
          'INSERT INTO jobseeker_profiles (user_id) VALUES ($1)',
          [user.id]
        );
      } else if (role === 'employer') {
        await client.query(
          'INSERT INTO employer_profiles (user_id, company_name) VALUES ($1, $2)',
          [user.id, '']
        );
      }
      
      await client.query('COMMIT');
      
      // Generate JWT token with explicit type handling
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION as any }  // Force type casting to resolve the type issue
      );
      
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginRequest = req.body;
  
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  try {
    // Find user by email
    const result = await pool.query(
      'SELECT id, email, password, role, first_name, last_name FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    const user = result.rows[0];
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Generate JWT token with type casting to resolve the issue
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION as any }  // Force type casting
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email }: ForgotPasswordRequest = req.body;
  
  if (!email) {
    res.status(400).json({ message: 'Email is required' });
    return;
  }

  try {
    // Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      res.status(200).json({ message: 'If your email exists in our system, a password reset link will be sent' });
      return;
    }
    
    const user = result.rows[0];
    
    // Generate reset token with proper typing
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, purpose: 'reset_password' },
      JWT_SECRET,
      { expiresIn: '1h' as any }  // Type casting for consistency
    );
    
    // Store token in database (in a real app, you would have a password_resets table)
    // For now, just return the token in the response (in a real app, send via email)
    res.status(200).json({
      message: 'Password reset link sent successfully',
      // In a real app, don't return this token in the response
      resetToken
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error processing password reset request' });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password }: ResetPasswordRequest = req.body;
  
  if (!token || !password) {
    res.status(400).json({ message: 'Token and password are required' });
    return;
  }

  try {
    // Verify token with proper type assertion
    interface TokenPayload {
      id: number;
      email: string;
      purpose: string;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    if (decoded.purpose !== 'reset_password') {
      res.status(400).json({ message: 'Invalid token' });
      return;
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Update user password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, decoded.id]
    );
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    
    if ((error as Error).name === 'JsonWebTokenError' || (error as Error).name === 'TokenExpiredError') {
      res.status(400).json({ message: 'Invalid or expired token' });
      return;
    }
    
    res.status(500).json({ message: 'Server error resetting password' });
  }
};
// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.config';
import { LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../types/auth.types';

// Register new user
export const register = async (req: Request, res: Response):Promise<void> => {
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
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: parseInt(process.env.JWT_EXPIRATION || '86400', 10) } // Convert to number if necessary
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
export const login = async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find user by email
    const result = await pool.query(
      'SELECT id, email, password, role, first_name, last_name FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRATION ? parseInt(process.env.JWT_EXPIRATION, 10) : '24h' }
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
export const forgotPassword = async (req: Request, res: Response) => {
  const { email }: ForgotPasswordRequest = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ message: 'If your email exists in our system, a password reset link will be sent' });
    }
    
    const user = result.rows[0];
    
    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, purpose: 'reset_password' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
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
export const resetPassword = async (req: Request, res: Response) => {
  const { token, password }: ResetPasswordRequest = req.body;
  
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { id: number; email: string; purpose: string };
    
    if (decoded.purpose !== 'reset_password') {
      return res.status(400).json({ message: 'Invalid token' });
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
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    res.status(500).json({ message: 'Server error resetting password' });
  }
};
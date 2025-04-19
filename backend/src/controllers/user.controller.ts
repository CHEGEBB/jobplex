// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db.config';
import { UpdateUserRequest } from '../types/user.types';

// Get current user profile
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get user data
    const userResult = await pool.query(
      'SELECT id, email, role, first_name, last_name FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    let profile = null;
    
    // Get profile based on role
    if (user.role === 'jobseeker') {
      const profileResult = await pool.query(
        'SELECT * FROM jobseeker_profiles WHERE user_id = $1',
        [userId]
      );
      
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    } else if (user.role === 'employer') {
      const profileResult = await pool.query(
        'SELECT * FROM employer_profiles WHERE user_id = $1',
        [userId]
      );
      
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    }
    
    // Format response
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      profile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update current user profile
export const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const {
      firstName,
      lastName,
      title,
      bio,
      location,
      companyName,
      companySize,
      industry
    }: UpdateUserRequest = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update user table
      if (firstName !== undefined || lastName !== undefined) {
        await client.query(
          'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), updated_at = CURRENT_TIMESTAMP WHERE id = $3',
          [firstName, lastName, userId]
        );
      }
      
      // Update profile based on role
      if (userRole === 'jobseeker') {
        if (title !== undefined || bio !== undefined || location !== undefined) {
          await client.query(
            'UPDATE jobseeker_profiles SET title = COALESCE($1, title), bio = COALESCE($2, bio), location = COALESCE($3, location), updated_at = CURRENT_TIMESTAMP WHERE user_id = $4',
            [title, bio, location, userId]
          );
        }
      } else if (userRole === 'employer') {
        if (companyName !== undefined || companySize !== undefined || industry !== undefined || location !== undefined) {
          await client.query(
            'UPDATE employer_profiles SET company_name = COALESCE($1, company_name), company_size = COALESCE($2, company_size), industry = COALESCE($3, industry), location = COALESCE($4, location), updated_at = CURRENT_TIMESTAMP WHERE user_id = $5',
            [companyName, companySize, industry, location, userId]
          );
        }
      }
      
      await client.query('COMMIT');
      
      // Get updated user data
      const updatedUser = await client.query(
        'SELECT id, email, role, first_name, last_name FROM users WHERE id = $1',
        [userId]
      );
      
      let profile = null;
      
      // Get updated profile based on role
      if (userRole === 'jobseeker') {
        const profileResult = await client.query(
          'SELECT * FROM jobseeker_profiles WHERE user_id = $1',
          [userId]
        );
        
        if (profileResult.rows.length > 0) {
          profile = profileResult.rows[0];
        }
      } else if (userRole === 'employer') {
        const profileResult = await client.query(
          'SELECT * FROM employer_profiles WHERE user_id = $1',
          [userId]
        );
        
        if (profileResult.rows.length > 0) {
          profile = profileResult.rows[0];
        }
      }
      
      res.json({
        id: updatedUser.rows[0].id,
        email: updatedUser.rows[0].email,
        role: updatedUser.rows[0].role,
        firstName: updatedUser.rows[0].first_name,
        lastName: updatedUser.rows[0].last_name,
        profile
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID (admin only)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get user data
    const userResult = await pool.query(
      'SELECT id, email, role, first_name, last_name FROM users WHERE id = $1',
      [id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    let profile = null;
    
    // Get profile based on role
    if (user.role === 'jobseeker') {
      const profileResult = await pool.query(
        'SELECT * FROM jobseeker_profiles WHERE user_id = $1',
        [id]
      );
      
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    } else if (user.role === 'employer') {
      const profileResult = await pool.query(
        'SELECT * FROM employer_profiles WHERE user_id = $1',
        [id]
      );
      
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    }
    
    // Format response
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      profile
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user by ID (admin only)
export const updateUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userRole = userCheck.rows[0].role;
    
    const {
      firstName,
      lastName,
      title,
      bio,
      location,
      companyName,
      companySize,
      industry
    }: UpdateUserRequest = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update user table
      if (firstName !== undefined || lastName !== undefined) {
        await client.query(
          'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), updated_at = CURRENT_TIMESTAMP WHERE id = $3',
          [firstName, lastName, id]
        );
      }
      
      // Update profile based on role
      if (userRole === 'jobseeker') {
        if (title !== undefined || bio !== undefined || location !== undefined) {
          await client.query(
            'UPDATE jobseeker_profiles SET title = COALESCE($1, title), bio = COALESCE($2, bio), location = COALESCE($3, location), updated_at = CURRENT_TIMESTAMP WHERE user_id = $4',
            [title, bio, location, id]
          );
        }
      } else if (userRole === 'employer') {
        if (companyName !== undefined || companySize !== undefined || industry !== undefined || location !== undefined) {
          await client.query(
            'UPDATE employer_profiles SET company_name = COALESCE($1, company_name), company_size = COALESCE($2, company_size), industry = COALESCE($3, industry), location = COALESCE($4, location), updated_at = CURRENT_TIMESTAMP WHERE user_id = $5',
            [companyName, companySize, industry, location, id]
          );
        }
      }
      
      await client.query('COMMIT');
      
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating user by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user by ID (admin only)
export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete operation (will cascade to profiles due to foreign key constraints)
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
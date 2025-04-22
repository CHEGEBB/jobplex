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

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // Optional filter parameters
    const role = req.query.role as string | undefined;
    const searchTerm = req.query.search as string | undefined;
    
    // Build the query
    let query = `
      SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.created_at, u.updated_at
      FROM users u
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    if (role) {
      query += ` AND u.role = $${paramIndex}`;
      queryParams.push(role);
      paramIndex++;
    }
    
    if (searchTerm) {
      query += ` AND (
        u.email ILIKE $${paramIndex} OR
        u.first_name ILIKE $${paramIndex} OR
        u.last_name ILIKE $${paramIndex}
      )`;
      queryParams.push(`%${searchTerm}%`);
      paramIndex++;
    }
    
    // Add pagination
    query += ` ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    // Count total users for pagination
    let countQuery = `
      SELECT COUNT(*) FROM users u
      WHERE 1=1
    `;
    
    if (role) {
      countQuery += ` AND u.role = $1`;
    }
    
    if (searchTerm) {
      countQuery += ` AND (
        u.email ILIKE $${role ? 2 : 1} OR
        u.first_name ILIKE $${role ? 2 : 1} OR
        u.last_name ILIKE $${role ? 2 : 1}
      )`;
    }
    
    // Execute queries
    const [userResults, countResults] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, role && searchTerm ? [role, `%${searchTerm}%`] : 
                          role ? [role] : 
                          searchTerm ? [`%${searchTerm}%`] : [])
    ]);
    
    const totalUsers = parseInt(countResults.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);
    
    // Format response
    res.json({
      users: userResults.rows.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      })),
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
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
      industry,
      email,
      role
    } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update user table
      if (firstName !== undefined || lastName !== undefined || email !== undefined || role !== undefined) {
        await client.query(
          'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), email = COALESCE($3, email), role = COALESCE($4, role), updated_at = CURRENT_TIMESTAMP WHERE id = $5',
          [firstName, lastName, email, role, id]
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
      
      // If role was changed, handle profile creation for the new role
      if (role !== undefined && role !== userRole) {
        if (role === 'jobseeker') {
          // Check if jobseeker profile already exists
          const profileCheck = await client.query(
            'SELECT * FROM jobseeker_profiles WHERE user_id = $1',
            [id]
          );
          
          if (profileCheck.rows.length === 0) {
            // Create empty jobseeker profile
            await client.query(
              'INSERT INTO jobseeker_profiles (user_id) VALUES ($1)',
              [id]
            );
          }
        } else if (role === 'employer') {
          // Check if employer profile already exists
          const profileCheck = await client.query(
            'SELECT * FROM employer_profiles WHERE user_id = $1',
            [id]
          );
          
          if (profileCheck.rows.length === 0) {
            // Create empty employer profile
            await client.query(
              'INSERT INTO employer_profiles (user_id) VALUES ($1)',
              [id]
            );
          }
        }
      }
      
      await client.query('COMMIT');
      
      // Get updated user data
      const updatedUser = await client.query(
        'SELECT id, email, role, first_name, last_name FROM users WHERE id = $1',
        [id]
      );
      
      const updatedUserRole = updatedUser.rows[0].role;
      let profile = null;
      
      // Get updated profile based on role
      if (updatedUserRole === 'jobseeker') {
        const profileResult = await client.query(
          'SELECT * FROM jobseeker_profiles WHERE user_id = $1',
          [id]
        );
        
        if (profileResult.rows.length > 0) {
          profile = profileResult.rows[0];
        }
      } else if (updatedUserRole === 'employer') {
        const profileResult = await client.query(
          'SELECT * FROM employer_profiles WHERE user_id = $1',
          [id]
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

// Change user role (admin only)
export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role || !['admin', 'jobseeker', 'employer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
    
    // Check if user exists
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentRole = userCheck.rows[0].role;
    
    // No change needed if role is the same
    if (currentRole === role) {
      return res.json({ message: 'User already has the specified role' });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update user role
      await client.query(
        'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [role, id]
      );
      
      // Create appropriate profile if it doesn't exist
      if (role === 'jobseeker') {
        const profileCheck = await client.query(
          'SELECT * FROM jobseeker_profiles WHERE user_id = $1',
          [id]
        );
        
        if (profileCheck.rows.length === 0) {
          // Create empty jobseeker profile
          await client.query(
            'INSERT INTO jobseeker_profiles (user_id) VALUES ($1)',
            [id]
          );
        }
      } else if (role === 'employer') {
        const profileCheck = await client.query(
          'SELECT * FROM employer_profiles WHERE user_id = $1',
          [id]
        );
        
        if (profileCheck.rows.length === 0) {
          // Create empty employer profile
          await client.query(
            'INSERT INTO employer_profiles (user_id) VALUES ($1)',
            [id]
          );
        }
      }
      
      await client.query('COMMIT');
      
      res.json({ message: 'User role updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Ban/unban user (admin only)
export const toggleUserBanStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { banned, reason } = req.body;
    
    if (typeof banned !== 'boolean') {
      return res.status(400).json({ message: 'Banned status must be a boolean' });
    }
    
    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user ban status
    await pool.query(
      'UPDATE users SET is_banned = $1, ban_reason = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [banned, banned ? reason || null : null, id]
    );
    
    res.json({ 
      message: banned ? 'User banned successfully' : 'User unbanned successfully',
      banned,
      banReason: banned ? reason || null : null
    });
  } catch (error) {
    console.error('Error toggling user ban status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user activity log (admin only)
export const getUserActivityLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user activity logs
    const activityLogs = await pool.query(
      'SELECT * FROM user_activity_logs WHERE user_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
    res.json(activityLogs.rows);
  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// src/controllers/skill.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db.config';
import { CreateSkillRequest, UpdateSkillRequest } from '../types/skill.types';

// Get all skills
export const getAllSkills = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM skills ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

// Get skill by ID
export const getSkillById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM skills WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching skill:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

// Create new skill (job seeker only)
export const createSkill = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // Check if user ID exists
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated or missing ID' });
    }
    
    const { name, proficiency, yearsExperience }: CreateSkillRequest = req.body;
    
    // Log the request data for debugging
    console.log('Create skill request:', { userId, name, proficiency, yearsExperience });
    
    // Validate required fields
    if (!name || !proficiency) {
      return res.status(400).json({ message: 'Name and proficiency are required' });
    }
    
    // Validate proficiency value
    const validProficiencies = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (!validProficiencies.includes(proficiency)) {
      return res.status(400).json({ 
        message: `Proficiency must be one of: ${validProficiencies.join(', ')}` 
      });
    }
    
    // Check if skill with same name already exists for this user
    const existingSkill = await pool.query(
      'SELECT * FROM skills WHERE user_id = $1 AND LOWER(name) = LOWER($2)',
      [userId, name]
    );
    
    if (existingSkill.rows.length > 0) {
      return res.status(409).json({ 
        message: 'You already have a skill with this name' 
      });
    }
    
    // Insert new skill with proper error handling
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const result = await client.query(
        'INSERT INTO skills (user_id, name, proficiency, years_experience) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, name, proficiency, yearsExperience || null]
      );
      
      await client.query('COMMIT');
      res.status(201).json(result.rows[0]);
    } catch (insertError) {
      await client.query('ROLLBACK');
      console.error('Database error when creating skill:', insertError);
      throw insertError; // This will be caught by the outer try-catch
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating skill:', error);
    // More detailed error response
    res.status(500).json({ 
      message: 'Server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Update skill (job seeker who created it only)
export const updateSkill = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated or missing ID' });
  }
  
  const { name, proficiency, yearsExperience }: UpdateSkillRequest = req.body;
  
  // Validate that at least one field is being updated
  if (!name && !proficiency && yearsExperience === undefined) {
    return res.status(400).json({ message: 'No update fields provided' });
  }
  
  // Validate proficiency if provided
  if (proficiency) {
    const validProficiencies = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (!validProficiencies.includes(proficiency)) {
      return res.status(400).json({ 
        message: `Proficiency must be one of: ${validProficiencies.join(', ')}` 
      });
    }
  }
  
  try {
    // Check if skill exists and belongs to the user
    const skillCheck = await pool.query(
      'SELECT * FROM skills WHERE id = $1',
      [id]
    );
    
    if (skillCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    if (skillCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'You can only update your own skills' });
    }
    
    // Check for name uniqueness if updating name
    if (name) {
      const nameCheck = await pool.query(
        'SELECT * FROM skills WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND id != $3',
        [userId, name, id]
      );
      
      if (nameCheck.rows.length > 0) {
        return res.status(409).json({ message: 'You already have another skill with this name' });
      }
    }
    
    // Update skill
    const result = await pool.query(
      `UPDATE skills 
       SET name = COALESCE($1, name), 
           proficiency = COALESCE($2, proficiency), 
           years_experience = COALESCE($3, years_experience),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [name, proficiency, yearsExperience, id, userId]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

// Delete skill (job seeker who created it only)
export const deleteSkill = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated or missing ID' });
  }
  
  try {
    // Check if skill exists and belongs to the user
    const skillCheck = await pool.query(
      'SELECT * FROM skills WHERE id = $1',
      [id]
    );
    
    if (skillCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    if (skillCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own skills' });
    }
    
    // Delete skill
    await pool.query('DELETE FROM skills WHERE id = $1 AND user_id = $2', [id, userId]);
    
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

// Get skills for current user (job seeker only)
export const getUserSkills = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated or missing ID' });
  }
  
  try {
    const result = await pool.query(
      'SELECT * FROM skills WHERE user_id = $1 ORDER BY name ASC',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user skills:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};
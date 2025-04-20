// src/controllers/portfolio.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db.config';
import { 
  Skill, 
  CreateSkillRequest, 
  Project, 
  CreateProjectRequest, 
  Certificate, 
  CreateCertificateRequest 
} from '../types/portfolio.types';

// SKILLS CONTROLLERS
export const getMySkills = async (req: Request, res: Response) => {
  try {
    // Ensure user object is attached from auth middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    console.log(`Fetching skills for user ID: ${userId}`);

    const result = await pool.query(
      'SELECT * FROM skills WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return res.status(500).json({ message: 'Failed to fetch skills' });
  }
};

export const createSkill = async (req: Request, res: Response) => {
  try {
    // Ensure user object is attached from auth middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    const { name, proficiency, years_experience }: CreateSkillRequest = req.body;

    // Validate input
    if (!name || !proficiency) {
      return res.status(400).json({ message: 'Name and proficiency are required' });
    }

    // Validate proficiency
    const validProficiencies = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (!validProficiencies.includes(proficiency)) {
      return res.status(400).json({ 
        message: `Proficiency must be one of: ${validProficiencies.join(', ')}`
      });
    }

    // Insert skill
    const result = await pool.query(
      `INSERT INTO skills (user_id, name, proficiency, years_experience) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [userId, name, proficiency, years_experience || 0]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating skill:', error);
    return res.status(500).json({ message: 'Failed to create skill' });
  }
};

export const updateSkill = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    const skillId = parseInt(req.params.id);
    const { name, proficiency, years_experience }: CreateSkillRequest = req.body;

    // Validate input
    if (!name || !proficiency) {
      return res.status(400).json({ message: 'Name and proficiency are required' });
    }

    // Validate proficiency
    const validProficiencies = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (!validProficiencies.includes(proficiency)) {
      return res.status(400).json({ 
        message: `Proficiency must be one of: ${validProficiencies.join(', ')}`
      });
    }

    // Check if skill exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM skills WHERE id = $1', 
      [skillId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'You can only update your own skills' });
    }

    // Update skill
    const result = await pool.query(
      `UPDATE skills 
       SET name = $1, proficiency = $2, years_experience = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [name, proficiency, years_experience || 0, skillId, userId]
    );

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating skill:', error);
    return res.status(500).json({ message: 'Failed to update skill' });
  }
};

export const deleteSkill = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    const skillId = parseInt(req.params.id);

    // Check if skill exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM skills WHERE id = $1', 
      [skillId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own skills' });
    }

    // Delete skill
    await pool.query('DELETE FROM skills WHERE id = $1 AND user_id = $2', [skillId, userId]);

    return res.status(200).json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return res.status(500).json({ message: 'Failed to delete skill' });
  }
};

// PROJECTS CONTROLLERS
export const getMyProjects = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    const { title, description, skills, github, link, image, featured }: CreateProjectRequest = req.body;

    // Validate input
    if (!title || !description || !skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: 'Title, description, and skills array are required' });
    }

    // Insert project
    const result = await pool.query(
      `INSERT INTO projects (user_id, title, description, skills, github, link, image, featured) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [userId, title, description, skills, github, link, 
       image || 'https://via.placeholder.com/600x400', featured || false]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ message: 'Failed to create project' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    const projectId = parseInt(req.params.id);
    const { title, description, skills, github, link, image, featured }: CreateProjectRequest = req.body;

    // Validate input
    if (!title || !description || !skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: 'Title, description, and skills array are required' });
    }

    // Check if project exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1', 
      [projectId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'You can only update your own projects' });
    }

    // Update project
    const result = await pool.query(
      `UPDATE projects 
       SET title = $1, description = $2, skills = $3, github = $4, link = $5, 
           image = $6, featured = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [title, description, skills, github, link, 
       image || checkResult.rows[0].image, featured, projectId, userId]
    );

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ message: 'Failed to update project' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    const projectId = parseInt(req.params.id);

    // Check if project exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1', 
      [projectId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own projects' });
    }

    // Delete project
    await pool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [projectId, userId]);

    return res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ message: 'Failed to delete project' });
  }
};

// CERTIFICATES CONTROLLERS
export const getMyCertificates = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM certificates WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return res.status(500).json({ message: 'Failed to fetch certificates' });
  }
};

export const createCertificate = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    const { name, issuer, date, expiry, credential_id, link }: CreateCertificateRequest = req.body;

    // Validate input
    if (!name || !issuer || !date) {
      return res.status(400).json({ message: 'Name, issuer, and date are required' });
    }

    // Insert certificate
    const result = await pool.query(
      `INSERT INTO certificates (user_id, name, issuer, date, expiry, credential_id, link) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [userId, name, issuer, date, expiry, credential_id, link]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating certificate:', error);
    return res.status(500).json({ message: 'Failed to create certificate' });
  }
};

export const updateCertificate = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    const certificateId = parseInt(req.params.id);
    const { name, issuer, date, expiry, credential_id, link }: CreateCertificateRequest = req.body;

    // Validate input
    if (!name || !issuer || !date) {
      return res.status(400).json({ message: 'Name, issuer, and date are required' });
    }

    // Check if certificate exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM certificates WHERE id = $1', 
      [certificateId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'You can only update your own certificates' });
    }

    // Update certificate
    const result = await pool.query(
      `UPDATE certificates 
       SET name = $1, issuer = $2, date = $3, expiry = $4, credential_id = $5, link = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [name, issuer, date, expiry, credential_id, link, certificateId, userId]
    );

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating certificate:', error);
    return res.status(500).json({ message: 'Failed to update certificate' });
  }
};

export const deleteCertificate = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    const certificateId = parseInt(req.params.id);

    // Check if certificate exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM certificates WHERE id = $1', 
      [certificateId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own certificates' });
    }

    // Delete certificate
    await pool.query('DELETE FROM certificates WHERE id = $1 AND user_id = $2', [certificateId, userId]);

    return res.status(200).json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    return res.status(500).json({ message: 'Failed to delete certificate' });
  }
};
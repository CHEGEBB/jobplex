// src/controllers/profile.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db.config';
import {
  ProfileUpdateData,
  SkillData,
  ExperienceData,
  EducationData,
  DocumentData
} from '../types/profile.types';



// Get the current user's profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    // req.user is guaranteed to exist because of the verifyToken middleware
    const userId = req.user!.id;    
    // Get basic profile info
    const profileResult = await pool.query(
      `SELECT * FROM job_seeker_profiles WHERE user_id = $1`,
      [userId]
    );
    
    // Get skills
    const skillsResult = await pool.query(
      `SELECT * FROM skills WHERE user_id = $1`,
      [userId]
    );
    
    // Get work experience
    const experienceResult = await pool.query(
      `SELECT * FROM work_experiences WHERE user_id = $1 ORDER BY is_current DESC, end_date DESC, start_date DESC`,
      [userId]
    );
    
    // Get education
    const educationResult = await pool.query(
      `SELECT * FROM education WHERE user_id = $1 ORDER BY is_current DESC, end_date DESC, start_date DESC`,
      [userId]
    );
    
    // Get documents
    const documentsResult = await pool.query(
      `SELECT * FROM user_documents WHERE user_id = $1`,
      [userId]
    );
    
    // Get user info
    const userResult = await pool.query(
      `SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE id = $1`,
      [userId]
    );
    
    if (profileResult.rows.length === 0) {
      // Create a blank profile if none exists
      const newProfile = await pool.query(
        `INSERT INTO job_seeker_profiles (user_id) VALUES ($1) RETURNING *`,
        [userId]
      );
      
      return res.json({
        user: userResult.rows[0],
        profile: newProfile.rows[0],
        skills: [],
        experience: [],
        education: [],
        documents: []
      });
    }
    
    res.json({
      user: userResult.rows[0],
      profile: profileResult.rows[0],
      skills: skillsResult.rows,
      experience: experienceResult.rows,
      education: educationResult.rows,
      documents: documentsResult.rows
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// Update the current user's profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { 
      title, bio, location, phone, website, linkedin_url, github_url,
      availability, desired_salary_range, is_remote_ok, willing_to_relocate,
      years_of_experience, education_level, preferred_job_types, preferred_industries
    } = req.body as ProfileUpdateData;
    
    // Check if profile exists
    const checkResult = await pool.query(
      `SELECT * FROM job_seeker_profiles WHERE user_id = $1`,
      [userId]
    );
    
    let profileResult;
    
    if (checkResult.rows.length === 0) {
      // Create new profile
      profileResult = await pool.query(
        `INSERT INTO job_seeker_profiles (
          user_id, title, bio, location, phone, website, linkedin_url, github_url,
          availability, desired_salary_range, is_remote_ok, willing_to_relocate,
          years_of_experience, education_level, preferred_job_types, preferred_industries,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
        RETURNING *`,
        [
          userId, title, bio, location, phone, website, linkedin_url, github_url,
          availability, desired_salary_range, is_remote_ok, willing_to_relocate,
          years_of_experience, education_level, preferred_job_types, preferred_industries
        ]
      );
    } else {
      // Update existing profile
      profileResult = await pool.query(
        `UPDATE job_seeker_profiles SET
          title = COALESCE($1, title),
          bio = COALESCE($2, bio),
          location = COALESCE($3, location),
          phone = COALESCE($4, phone),
          website = COALESCE($5, website),
          linkedin_url = COALESCE($6, linkedin_url),
          github_url = COALESCE($7, github_url),
          availability = COALESCE($8, availability),
          desired_salary_range = COALESCE($9, desired_salary_range),
          is_remote_ok = COALESCE($10, is_remote_ok),
          willing_to_relocate = COALESCE($11, willing_to_relocate),
          years_of_experience = COALESCE($12, years_of_experience),
          education_level = COALESCE($13, education_level),
          preferred_job_types = COALESCE($14, preferred_job_types),
          preferred_industries = COALESCE($15, preferred_industries),
          updated_at = NOW()
        WHERE user_id = $16
        RETURNING *`,
        [
          title, bio, location, phone, website, linkedin_url, github_url,
          availability, desired_salary_range, is_remote_ok, willing_to_relocate,
          years_of_experience, education_level, preferred_job_types, preferred_industries,
          userId
        ]
      );
    }
    
    res.json({
      success: true,
      profile: profileResult.rows[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// Upload profile photo
export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const photoUrl = req.body.photoUrl; // In a real app, this would come from file upload service
    
    const result = await pool.query(
      `UPDATE job_seeker_profiles SET profile_photo_url = $1, updated_at = NOW()
      WHERE user_id = $2 RETURNING *`,
      [photoUrl, userId]
    );
    
    res.json({
      success: true,
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ message: 'Server error while uploading photo' });
  }
};

// Add/Update skill
export const addSkill = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, proficiency, years_experience } = req.body as SkillData;
    
    // Check if skill already exists for this user
    const checkResult = await pool.query(
      `SELECT * FROM skills WHERE user_id = $1 AND name = $2`,
      [userId, name]
    );
    
    let skillResult;
    
    if (checkResult.rows.length === 0) {
      // Add new skill
      skillResult = await pool.query(
        `INSERT INTO skills (user_id, name, proficiency, years_experience, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *`,
        [userId, name, proficiency, years_experience]
      );
    } else {
      // Update existing skill
      skillResult = await pool.query(
        `UPDATE skills SET
          proficiency = $1,
          years_experience = $2,
          updated_at = NOW()
        WHERE user_id = $3 AND name = $4
        RETURNING *`,
        [proficiency, years_experience, userId, name]
      );
    }
    
    res.json({
      success: true,
      skill: skillResult.rows[0]
    });
  } catch (error) {
    console.error('Error adding/updating skill:', error);
    res.status(500).json({ message: 'Server error while managing skills' });
  }
};

// Remove skill
export const removeSkill = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const skillId = req.params.id;
    
    await pool.query(
      `DELETE FROM skills WHERE id = $1 AND user_id = $2`,
      [skillId, userId]
    );
    
    res.json({
      success: true,
      message: 'Skill removed successfully'
    });
  } catch (error) {
    console.error('Error removing skill:', error);
    res.status(500).json({ message: 'Server error while removing skill' });
  }
};

// Add work experience
export const addExperience = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { 
      company_name, position, location, start_date, end_date, 
      is_current, description 
    } = req.body as ExperienceData;
    
    const result = await pool.query(
      `INSERT INTO work_experiences (
        user_id, company_name, position, location, start_date, 
        end_date, is_current, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        userId, company_name, position, location, start_date, 
        end_date, is_current, description
      ]
    );
    
    res.json({
      success: true,
      experience: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding work experience:', error);
    res.status(500).json({ message: 'Server error while adding experience' });
  }
};

// Update work experience
export const updateExperience = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const expId = req.params.id;
    const { 
      company_name, position, location, start_date, end_date, 
      is_current, description 
    } = req.body as ExperienceData;
    
    const result = await pool.query(
      `UPDATE work_experiences SET
        company_name = COALESCE($1, company_name),
        position = COALESCE($2, position),
        location = COALESCE($3, location),
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date),
        is_current = COALESCE($6, is_current),
        description = COALESCE($7, description),
        updated_at = NOW()
      WHERE id = $8 AND user_id = $9
      RETURNING *`,
      [
        company_name, position, location, start_date, end_date, 
        is_current, description, expId, userId
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Experience not found' });
    }
    
    res.json({
      success: true,
      experience: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating work experience:', error);
    res.status(500).json({ message: 'Server error while updating experience' });
  }
};

// Delete work experience
export const deleteExperience = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const expId = req.params.id;
    
    const result = await pool.query(
      `DELETE FROM work_experiences
      WHERE id = $1 AND user_id = $2
      RETURNING *`,
      [expId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Experience not found' });
    }
    
    res.json({
      success: true,
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting work experience:', error);
    res.status(500).json({ message: 'Server error while deleting experience' });
  }
};

// Add education
export const addEducation = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { 
      institution, degree, field_of_study, start_date, end_date, 
      is_current, description 
    } = req.body as EducationData;
    
    const result = await pool.query(
      `INSERT INTO education (
        user_id, institution, degree, field_of_study, start_date, 
        end_date, is_current, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        userId, institution, degree, field_of_study, start_date, 
        end_date, is_current, description
      ]
    );
    
    res.json({
      success: true,
      education: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({ message: 'Server error while adding education' });
  }
};

// Update education
export const updateEducation = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const eduId = req.params.id;
    const { 
      institution, degree, field_of_study, start_date, end_date, 
      is_current, description 
    } = req.body as EducationData;
    
    const result = await pool.query(
      `UPDATE education SET
        institution = COALESCE($1, institution),
        degree = COALESCE($2, degree),
        field_of_study = COALESCE($3, field_of_study),
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date),
        is_current = COALESCE($6, is_current),
        description = COALESCE($7, description),
        updated_at = NOW()
      WHERE id = $8 AND user_id = $9
      RETURNING *`,
      [
        institution, degree, field_of_study, start_date, end_date, 
        is_current, description, eduId, userId
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Education record not found' });
    }
    
    res.json({
      success: true,
      education: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating education:', error);
    res.status(500).json({ message: 'Server error while updating education' });
  }
};

// Delete education
export const deleteEducation = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const eduId = req.params.id;
    
    const result = await pool.query(
      `DELETE FROM education
      WHERE id = $1 AND user_id = $2
      RETURNING *`,
      [eduId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Education record not found' });
    }
    
    res.json({
      success: true,
      message: 'Education record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting education:', error);
    res.status(500).json({ message: 'Server error while deleting education' });
  }
};

// Upload document (resume, certificates)
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { document_type, document_url, filename } = req.body as DocumentData;
    
    const result = await pool.query(
      `INSERT INTO user_documents (user_id, document_type, document_url, filename)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [userId, document_type, document_url, filename]
    );
    
    // If this is a resume, update the profile with resume_url
    if (document_type === 'resume') {
      await pool.query(
        `UPDATE job_seeker_profiles SET
          resume_url = $1,
          updated_at = NOW()
        WHERE user_id = $2`,
        [document_url, userId]
      );
    }
    
    res.json({
      success: true,
      document: result.rows[0]
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Server error while uploading document' });
  }
};

// Delete document
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const docId = req.params.id;
    
    // Check if document exists and get its type
    const checkResult = await pool.query(
      `SELECT * FROM user_documents WHERE id = $1 AND user_id = $2`,
      [docId, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const document = checkResult.rows[0];
    
    // Delete the document
    await pool.query(
      `DELETE FROM user_documents WHERE id = $1`,
      [docId]
    );
    
    // If this was a resume, clear the resume_url in profile
    if (document.document_type === 'resume') {
      await pool.query(
        `UPDATE job_seeker_profiles SET
          resume_url = NULL,
          updated_at = NOW()
        WHERE user_id = $1`,
        [userId]
      );
    }
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server error while deleting document' });
  }
};
import { Request, Response } from 'express';
import pool from '../config/db.config';
import { CreateEmployerProfileDto, UpdateEmployerProfileDto } from '../types/employer-profile.types';

// Get employer profile for current user
export const getEmployerProfile = async (req: Request, res: Response) => {
  try {
    // User id comes from the authenticated JWT token
    const userId = req.user!.id;

    // Check if the profile exists
    const profileResult = await pool.query(
      'SELECT * FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    // Return the profile
    res.json(profileResult.rows[0]);
  } catch (error) {
    console.error('Error fetching employer profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new employer profile
export const createEmployerProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const profileData: CreateEmployerProfileDto = req.body;

    // Check if user already has a profile
    const existingProfile = await pool.query(
      'SELECT * FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    if (existingProfile.rows.length > 0) {
      return res.status(400).json({ message: 'Employer profile already exists' });
    }

    // Validate user role is 'employer'
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can create company profiles' });
    }

    // Create the profile
    const result = await pool.query(
      `INSERT INTO employer_profiles (
        user_id, name, logo, cover_image, description, industry, 
        founded, size, headquarters, website, phone, email, 
        mission, vision, culture, benefits, social_responsibility, 
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW()) 
      RETURNING *`,
      [
        userId,
        profileData.name,
        profileData.logo,
        profileData.coverImage,
        profileData.description,
        profileData.industry,
        profileData.founded,
        profileData.size,
        profileData.headquarters,
        profileData.website,
        profileData.phone,
        profileData.email,
        profileData.mission,
        profileData.vision,
        JSON.stringify(profileData.culture),
        JSON.stringify(profileData.benefits),
        JSON.stringify(profileData.socialResponsibility)
      ]
    );

    // Format response to match frontend expectations
    const newProfile = {
      ...result.rows[0],
      coverImage: result.rows[0].cover_image,
      culture: typeof result.rows[0].culture === 'string' ? JSON.parse(result.rows[0].culture) : result.rows[0].culture,
      benefits: typeof result.rows[0].benefits === 'string' ? JSON.parse(result.rows[0].benefits) : result.rows[0].benefits,
      socialResponsibility: typeof result.rows[0].social_responsibility === 'string' 
        ? JSON.parse(result.rows[0].social_responsibility) 
        : result.rows[0].social_responsibility
    };

    res.status(201).json(newProfile);
  } catch (error) {
    console.error('Error creating employer profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an existing employer profile
export const updateEmployerProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const profileData: UpdateEmployerProfileDto = req.body;

    // Check if profile exists
    const existingProfile = await pool.query(
      'SELECT * FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    if (existingProfile.rows.length === 0) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    // Update the profile
    const result = await pool.query(
      `UPDATE employer_profiles SET
        name = $1,
        logo = $2,
        cover_image = $3,
        description = $4,
        industry = $5,
        founded = $6,
        size = $7,
        headquarters = $8,
        website = $9,
        phone = $10,
        email = $11,
        mission = $12,
        vision = $13,
        culture = $14,
        benefits = $15,
        social_responsibility = $16,
        updated_at = NOW()
      WHERE user_id = $17
      RETURNING *`,
      [
        profileData.name,
        profileData.logo,
        profileData.coverImage,
        profileData.description,
        profileData.industry,
        profileData.founded,
        profileData.size,
        profileData.headquarters,
        profileData.website,
        profileData.phone,
        profileData.email,
        profileData.mission,
        profileData.vision,
        JSON.stringify(profileData.culture),
        JSON.stringify(profileData.benefits),
        JSON.stringify(profileData.socialResponsibility),
        userId
      ]
    );

    // Format response to match frontend expectations
    const updatedProfile = {
      ...result.rows[0],
      coverImage: result.rows[0].cover_image,
      culture: typeof result.rows[0].culture === 'string' ? JSON.parse(result.rows[0].culture) : result.rows[0].culture,
      benefits: typeof result.rows[0].benefits === 'string' ? JSON.parse(result.rows[0].benefits) : result.rows[0].benefits,
      socialResponsibility: typeof result.rows[0].social_responsibility === 'string' 
        ? JSON.parse(result.rows[0].social_responsibility) 
        : result.rows[0].social_responsibility
    };

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating employer profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an employer profile
export const deleteEmployerProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Check if profile exists
    const existingProfile = await pool.query(
      'SELECT * FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    if (existingProfile.rows.length === 0) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    // Delete the profile
    await pool.query(
      'DELETE FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employer profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
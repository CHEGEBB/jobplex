import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../config/db.config';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI with API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY || '';
console.log("Using Gemini API Key:", API_KEY ? `${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}` : 'MISSING API KEY');

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// For Job Seekers: Get career path recommendations
export const getCareerPathRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log(`Getting career recommendations for user ${userId}`);

    // Get user skills from database
    const userSkillsResult = await pool.query(
      'SELECT name, proficiency, years_experience FROM skills WHERE user_id = $1',
      [userId]
    );
    
    if (userSkillsResult.rows.length === 0) {
      return res.status(400).json({ 
        message: 'Please add skills to your profile to get career recommendations' 
      });
    }

    const userSkills = userSkillsResult.rows;
    console.log(`Found ${userSkills.length} skills for user`);
    
    // Get user profile information
    const userProfileResult = await pool.query(
      'SELECT title, bio FROM job_seeker_profiles WHERE user_id = $1',
      [userId]
    );
    
    const userProfile = userProfileResult.rows[0] || { title: '', bio: '' };
    
    // Format prompt for Gemini
    const prompt = `
      As a career advisor, recommend 3 potential career paths for a professional with the following skills and background:
      
      Current Title: ${userProfile.title || 'Not specified'}
      Bio: ${userProfile.bio || 'Not specified'}
      Skills:
      ${userSkills.map(skill => `- ${skill.name} (${skill.proficiency}, ${skill.years_experience} years)`).join('\n')}
      
      For each career path, provide:
      1. Job title
      2. Brief job description
      3. Match percentage based on current skills
      4. List of skill gaps that need to be filled
      5. Learning resources to acquire those skills
      
      Format the response as a JSON array with the structure:
      [
        {
          "title": "Job Title",
          "description": "Job description",
          "matchPercentage": number from 0-100,
          "skillGaps": ["skill1", "skill2"],
          "learningResources": ["resource1", "resource2"]
        }
      ]
      
      Provide only the JSON array with no additional text.
    `;

    console.log("Sending request to Gemini API...");
    
    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Received response from Gemini API");
    
    // Parse the JSON response
    try {
      const recommendations = JSON.parse(text);
      return res.json({ recommendations });
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw AI response:', text);
      return res.status(500).json({ 
        message: 'Error processing AI recommendations',
        aiResponse: text
      });
    }
    
  } catch (error) {
    console.error('Error generating career recommendations:', error);
    return res.status(500).json({ message: 'Server error generating recommendations' });
  }
};
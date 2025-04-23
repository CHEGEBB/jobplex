import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../config/db.config';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Types for AI responses
interface CareerPathRecommendation {
  title: string;
  description: string;
  matchPercentage: number;
  skillGaps: string[];
  learningResources: string[];
}

interface CandidateMatch {
  userId: number;
  firstName: string;
  lastName: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
}

// For Job Seekers: Get career path recommendations
export const getCareerPathRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

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
    
    // Get user profile information
    const userProfileResult = await pool.query(
      'SELECT jp.title, jp.bio FROM job_seeker_profiles jp JOIN users u ON jp.user_id = u.id WHERE u.id = $1',
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

    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      const recommendations: CareerPathRecommendation[] = JSON.parse(text);
      return res.json({ recommendations });
    } catch (error) {
      console.error('Error parsing AI response:', error);
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

// For Employers: Match candidates to job posting
export const matchCandidatesToJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Verify the job belongs to this employer
    const jobCheckResult = await pool.query(
      'SELECT * FROM jobs WHERE id = $1 AND employer_id = $2',
      [jobId, userId]
    );
    
    if (jobCheckResult.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found or you do not have permission to access it' });
    }
    
    const job = jobCheckResult.rows[0];
    
    // Get required skills for the job
    const jobSkillsResult = await pool.query(
      'SELECT skill_name, importance FROM job_skills WHERE job_id = $1',
      [jobId]
    );
    
    const jobSkills = jobSkillsResult.rows;
    
    if (jobSkills.length === 0) {
      return res.status(400).json({ message: 'Job has no skills defined for matching' });
    }
    
    // Build a query to find matching candidates
    // This query calculates a match percentage based on skills
    const matchQuery = `
      WITH job_required_skills AS (
        SELECT skill_name, importance
        FROM job_skills
        WHERE job_id = $1
      ),
      user_skills AS (
        SELECT 
          u.id as user_id,
          u.first_name,
          u.last_name,
          s.name as skill_name,
          s.proficiency
        FROM users u
        JOIN skills s ON u.id = s.user_id
        WHERE u.role = 'job_seeker'
      ),
      matches AS (
        SELECT 
          us.user_id,
          us.first_name,
          us.last_name,
          COUNT(DISTINCT jrs.skill_name) AS matched_skills,
          (SELECT COUNT(DISTINCT skill_name) FROM job_required_skills) AS total_required_skills
        FROM user_skills us
        JOIN job_required_skills jrs ON LOWER(us.skill_name) = LOWER(jrs.skill_name)
        GROUP BY us.user_id, us.first_name, us.last_name
      )
      SELECT 
        user_id,
        first_name,
        last_name,
        matched_skills,
        total_required_skills,
        ROUND((matched_skills::numeric / total_required_skills::numeric) * 100) AS match_percentage
      FROM matches
      WHERE matched_skills > 0
      ORDER BY match_percentage DESC
      LIMIT 10;
    `;
    
    const matchResults = await pool.query(matchQuery, [jobId]);
    const candidates = matchResults.rows;
    
    // For each candidate, get their matched and missing skills
    const candidatesWithDetails = await Promise.all(candidates.map(async (candidate) => {
      // Get user's skills
      const userSkillsResult = await pool.query(
        'SELECT name FROM skills WHERE user_id = $1',
        [candidate.user_id]
      );
      
      const userSkillNames = userSkillsResult.rows.map(row => row.name.toLowerCase());
      
      // Determine matched and missing skills
      const requiredSkillNames = jobSkills.map(skill => skill.skill_name.toLowerCase());
      const matchedSkills = requiredSkillNames.filter(skill => userSkillNames.includes(skill));
      const missingSkills = requiredSkillNames.filter(skill => !userSkillNames.includes(skill));
      
      return {
        userId: candidate.user_id,
        firstName: candidate.first_name,
        lastName: candidate.last_name,
        matchPercentage: parseInt(candidate.match_percentage),
        matchedSkills,
        missingSkills
      };
    }));
    
    return res.json({ 
      jobTitle: job.title,
      candidates: candidatesWithDetails
    });
    
  } catch (error) {
    console.error('Error matching candidates:', error);
    return res.status(500).json({ message: 'Server error matching candidates' });
  }
};

// Generate job description from requirements
export const generateJobDescription = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      companyName, 
      location,
      requiredSkills,
      jobType,
      experienceLevel
    } = req.body;
    
    // Validate required fields
    if (!title || !companyName || !requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Format prompt for Gemini
    const prompt = `
      Generate a professional job description for the following position:
      
      Job Title: ${title}
      Company: ${companyName}
      Location: ${location || 'Remote'}
      Job Type: ${jobType || 'Full-time'}
      Experience Level: ${experienceLevel || 'Not specified'}
      
      Required Skills:
      ${requiredSkills.join(', ')}
      
      Include the following sections:
      1. About the Company
      2. Job Description
      3. Responsibilities
      4. Requirements
      5. Benefits (if applicable)
      
      Format the response as JSON with the structure:
      {
        "about": "Company description",
        "description": "Job description",
        "responsibilities": ["responsibility1", "responsibility2", ...],
        "requirements": ["requirement1", "requirement2", ...],
        "benefits": ["benefit1", "benefit2", ...]
      }
      
      Provide only the JSON with no additional text.
    `;

    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      const jobDescription = JSON.parse(text);
      return res.json({ jobDescription });
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return res.status(500).json({ 
        message: 'Error processing AI-generated job description',
        aiResponse: text
      });
    }
    
  } catch (error) {
    console.error('Error generating job description:', error);
    return res.status(500).json({ message: 'Server error generating job description' });
  }
};

// Analyze resume for job seekers
export const analyzeResume = async (req: Request, res: Response) => {
  try {
    const { resumeText } = req.body;
    
    if (!resumeText) {
      return res.status(400).json({ message: 'Resume text is required' });
    }
    
    // Format prompt for Gemini
    const prompt = `
      Analyze the following resume and extract the key information:
      
      ${resumeText}
      
      Format the response as JSON with the structure:
      {
        "skills": ["skill1", "skill2", ...],
        "experience": [
          {
            "title": "Job Title",
            "company": "Company Name",
            "duration": "Duration",
            "responsibilities": ["responsibility1", "responsibility2", ...]
          }
        ],
        "education": [
          {
            "degree": "Degree Name",
            "institution": "Institution Name",
            "year": "Year Completed"
          }
        ],
        "suggestions": ["suggestion1", "suggestion2", ...]
      }
      
      Provide only the JSON with no additional text.
    `;

    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      const resumeAnalysis = JSON.parse(text);
      return res.json({ resumeAnalysis });
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return res.status(500).json({ 
        message: 'Error processing resume analysis',
        aiResponse: text
      });
    }
    
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return res.status(500).json({ message: 'Server error analyzing resume' });
  }
};
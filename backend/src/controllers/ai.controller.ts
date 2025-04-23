// src/controllers/ai.controller.ts
import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../config/db.config';
import { JobSeekerCareerPathResponse, EmployerCandidateMatchResponse } from '../types/ai.types';

// Better logging for the API key status
const apiKey = process.env.GEMINI_API_KEY || '';
console.log(`Gemini API Key status: ${apiKey ? 'Present' : 'Missing'}`);
console.log(`Gemini API Key value: ${apiKey ? apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4) : 'None'}`);

// Initialize Gemini AI only if we have a key
let genAI: any = null;
let model: any = null;

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('Gemini AI model initialized successfully');
  } catch (error) {
    console.error('Error initializing Gemini AI:', error);
  }
}

/**
 * Get AI-recommended career paths for job seekers based on their skills
 */
export const getCareerPathRecommendations = async (req: Request, res: Response) => {
  try {
    console.log('Getting career recommendations for user', req.user!.id);
    
    // Check if Gemini is properly initialized
    if (!genAI || !model) {
      console.error('Gemini AI not initialized. API key missing or invalid.');
      return res.status(500).json({ 
        message: 'AI service is not available. API key missing or invalid.' 
      });
    }
    
    const userId = req.user!.id; // From JWT token

    // Fetch user's skills from database
    const skillsResult = await pool.query(
      `SELECT name, proficiency, years_experience 
       FROM skills 
       WHERE user_id = $1`, 
      [userId]
    );

    const skills = skillsResult.rows;
    console.log(`Found ${skills.length} skills for user`);
    
    if (skills.length === 0) {
      return res.status(400).json({ 
        message: 'You need to add skills to your profile before getting career recommendations' 
      });
    }

    // Fetch user profile for more context
    const profileResult = await pool.query(
      `SELECT jsp.title, jsp.bio, jsp.location
       FROM job_seeker_profiles jsp
       WHERE jsp.user_id = $1`,
      [userId]
    );

    const profile = profileResult.rows[0] || {};

    // Format skills for AI prompt
    const skillsFormatted = skills.map(skill => 
      `${skill.name} (${skill.proficiency}, ${skill.years_experience} years)`
    ).join(', ');

    // Create prompt for AI
    const prompt = `
    You are a career advisor AI for JobPlex, a skills-based job matching platform. 
    Please analyze the following job seeker's skills and provide personalized career path recommendations.
    
    User Skills: ${skillsFormatted}
    ${profile.title ? `Current Title: ${profile.title}` : ''}
    ${profile.bio ? `Bio: ${profile.bio}` : ''}
    ${profile.location ? `Location: ${profile.location}` : ''}
    
    Provide a JSON response with the following structure:
    {
      "careerPaths": [
        {
          "title": "Career path title",
          "description": "Brief description of this career path",
          "matchPercentage": 85, // how well their current skills match this path
          "skillGaps": ["Skill 1", "Skill 2"], // skills they should develop
          "learningResources": [
            {
              "name": "Resource name",
              "type": "course/book/certification",
              "description": "Brief description"
            }
          ]
        }
      ],
      "analysis": "Brief personalized analysis of their skills and potential"
    }
    
    Provide 3 career paths maximum, focused on quality recommendations. Each path should be realistic based on their current skills.
    `;

    // Call Gemini API
    console.log('Sending request to Gemini API...');
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Parse the JSON response
      try {
        // Extract JSON from possible text
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || [null, text];
        const jsonStr = jsonMatch[1] || text;
        
        const parsedResponse: JobSeekerCareerPathResponse = JSON.parse(jsonStr);
        
        return res.json(parsedResponse);
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        return res.status(500).json({ 
          message: 'Error processing AI response',
          rawResponse: text
        });
      }
    } catch (aiError) {
      console.error('Error generating career recommendations:', aiError);
      return res.status(500).json({ 
        message: 'Error connecting to AI service',
        error: aiError instanceof Error ? aiError.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Error in career path recommendations:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Match candidates to a job posting based on skills
 */
export const matchCandidates = async (req: Request, res: Response) => {
  try {
    // Check if Gemini is properly initialized
    if (!genAI || !model) {
      console.error('Gemini AI not initialized. API key missing or invalid.');
      return res.status(500).json({ 
        message: 'AI service is not available. API key missing or invalid.' 
      });
    }
    
    const employerId = req.user!.id; // From JWT token
    const { jobId } = req.params;
    
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    // Verify the job belongs to this employer
    const jobResult = await pool.query(
      'SELECT * FROM jobs WHERE id = $1 AND employer_id = $2',
      [jobId, employerId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found or you do not have permission to access it' });
    }

    const job = jobResult.rows[0];

    // Get job skills
    const jobSkillsResult = await pool.query(
      'SELECT skill_name, importance FROM job_skills WHERE job_id = $1',
      [jobId]
    );

    const jobSkills = jobSkillsResult.rows;
    
    // First, let's get all job seekers with matching skills
    // More complex database query to find candidates with matching skills
    const candidatesResult = await pool.query(`
      SELECT 
        u.id AS user_id,
        u.email,
        u.first_name,
        u.last_name,
        jsp.title,
        jsp.bio,
        jsp.location,
        array_agg(DISTINCT s.name) AS skills,
        array_agg(DISTINCT s.proficiency) AS proficiencies,
        array_agg(DISTINCT s.years_experience) AS experiences
      FROM users u
      JOIN job_seeker_profiles jsp ON u.id = jsp.user_id
      JOIN skills s ON u.id = s.user_id
      WHERE u.role = 'job_seeker'
      GROUP BY u.id, u.email, u.first_name, u.last_name, jsp.title, jsp.bio, jsp.location
    `);

    // Now we'll perform a more advanced match using Gemini AI
    const jobDescription = `
      Job Title: ${job.title}
      Description: ${job.description}
      Location: ${job.location || 'Not specified'}
      Job Type: ${job.job_type || 'Not specified'}
      Required Skills: ${jobSkills
        .filter(s => s.importance === 'required')
        .map(s => s.skill_name)
        .join(', ')}
      Preferred Skills: ${jobSkills
        .filter(s => s.importance === 'preferred' || s.importance === 'nice-to-have')
        .map(s => s.skill_name)
        .join(', ')}
    `;

    // Format candidates for AI prompt
    const candidatesForAI = candidatesResult.rows.map(candidate => {
      // Create a skills string with proficiency and experience
      const skillDetails = candidate.skills.map((skill: string, index: number) => {
        return `${skill} (${candidate.proficiencies[index]}, ${candidate.experiences[index]} years)`;
      }).join(', ');
      
      return {
        id: candidate.user_id,
        name: `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim(),
        title: candidate.title || 'Not specified',
        bio: candidate.bio || 'Not specified',
        skills: skillDetails
      };
    });

    // Create prompt for AI
    const prompt = `
    You are an AI-powered candidate matching system for JobPlex, a skills-based job matching platform.
    Please analyze the following job posting and potential candidates to determine the best matches based primarily on skills.
    
    JOB POSTING:
    ${jobDescription}
    
    CANDIDATES:
    ${JSON.stringify(candidatesForAI, null, 2)}
    
    Instructions:
    1. Match candidates based primarily on their skills compared to required and preferred job skills
    2. Consider experience level and proficiency in these skills
    3. Provide a match percentage and short explanation for each candidate
    4. Focus on actual skills rather than job titles
    
    Provide a JSON response with the following structure:
    {
      "candidates": [
        {
          "id": "candidate_id",
          "name": "Candidate Name",
          "matchPercentage": 85,
          "matchReason": "Brief explanation of why this candidate is a good match",
          "missingSkills": ["Skill 1", "Skill 2"]
        }
      ]
    }
    
    Sort candidates by match percentage in descending order.
    `;

    // Call Gemini API
    console.log('Sending request to Gemini API for candidate matching...');
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Parse the JSON response
      try {
        // Extract JSON from possible text
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || [null, text];
        const jsonStr = jsonMatch[1] || text;
        
        const parsedResponse: EmployerCandidateMatchResponse = JSON.parse(jsonStr);
        
        return res.json(parsedResponse);
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        return res.status(500).json({ 
          message: 'Error processing AI response',
          rawResponse: text
        });
      }
    } catch (aiError) {
      console.error('Error matching candidates:', aiError);
      return res.status(500).json({ 
        message: 'Error connecting to AI service',
        error: aiError instanceof Error ? aiError.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Error in candidate matching:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
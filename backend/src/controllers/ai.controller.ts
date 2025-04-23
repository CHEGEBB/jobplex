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
        
        // Save the career path recommendation to the database
        await saveCareerPath(userId, parsedResponse);
        
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
 * Save career path recommendation to database
 */
const saveCareerPath = async (userId: number, careerPath: JobSeekerCareerPathResponse) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert main career path record
    const careerPathResult = await client.query(
      `INSERT INTO user_career_paths (user_id, analysis, created_at)
       VALUES ($1, $2, NOW())
       RETURNING id`,
      [userId, careerPath.analysis]
    );
    
    const careerPathId = careerPathResult.rows[0].id;
    
    // Insert each career path option
    for (const path of careerPath.careerPaths) {
      const pathResult = await client.query(
        `INSERT INTO career_path_options (career_path_id, title, description, match_percentage)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [careerPathId, path.title, path.description, path.matchPercentage]
      );
      
      const pathOptionId = pathResult.rows[0].id;
      
      // Insert skill gaps
      if (path.skillGaps && path.skillGaps.length > 0) {
        for (const skill of path.skillGaps) {
          await client.query(
            `INSERT INTO career_path_skill_gaps (career_path_option_id, skill_name)
             VALUES ($1, $2)`,
            [pathOptionId, skill]
          );
        }
      }
      
      // Insert learning resources
      if (path.learningResources && path.learningResources.length > 0) {
        for (const resource of path.learningResources) {
          await client.query(
            `INSERT INTO career_path_learning_resources (career_path_option_id, name, type, description)
             VALUES ($1, $2, $3, $4)`,
            [pathOptionId, resource.name, resource.type, resource.description]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    console.log(`Career path saved successfully for user ${userId}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving career path:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get saved career paths for a user
 */
export const getSavedCareerPaths = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Query to get all career paths with their options, skill gaps, and learning resources
    const result = await pool.query(`
      WITH career_paths AS (
        SELECT 
          ucp.id, 
          ucp.analysis, 
          ucp.created_at
        FROM user_career_paths ucp
        WHERE ucp.user_id = $1
        ORDER BY ucp.created_at DESC
      ),
      path_options AS (
        SELECT 
          cpo.id as option_id,
          cpo.career_path_id,
          cpo.title,
          cpo.description,
          cpo.match_percentage,
          json_agg(DISTINCT cpsg.skill_name) FILTER (WHERE cpsg.skill_name IS NOT NULL) as skill_gaps,
          json_agg(
            json_build_object(
              'name', cplr.name,
              'type', cplr.type,
              'description', cplr.description
            )
          ) FILTER (WHERE cplr.name IS NOT NULL) as learning_resources
        FROM career_path_options cpo
        LEFT JOIN career_path_skill_gaps cpsg ON cpo.id = cpsg.career_path_option_id
        LEFT JOIN career_path_learning_resources cplr ON cpo.id = cplr.career_path_option_id
        WHERE cpo.career_path_id IN (SELECT id FROM career_paths)
        GROUP BY cpo.id, cpo.career_path_id
      )
      SELECT 
        cp.id,
        cp.analysis,
        cp.created_at,
        json_agg(
          json_build_object(
            'title', po.title,
            'description', po.description,
            'matchPercentage', po.match_percentage,
            'skillGaps', COALESCE(po.skill_gaps, '[]'::json),
            'learningResources', COALESCE(po.learning_resources, '[]'::json)
          )
        ) as career_paths
      FROM career_paths cp
      JOIN path_options po ON cp.id = po.career_path_id
      GROUP BY cp.id, cp.analysis, cp.created_at
      ORDER BY cp.created_at DESC
    `, [userId]);
    
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching saved career paths:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a saved career path
 */
export const deleteCareerPath = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const userId = req.user!.id;
    const { careerPathId } = req.params;
    
    // First, check if the career path exists and belongs to the user
    const checkResult = await client.query(
      'SELECT id FROM user_career_paths WHERE id = $1 AND user_id = $2',
      [careerPathId, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Career path not found or you do not have permission to delete it' });
    }
    
    await client.query('BEGIN');
    
    // Delete all related learning resources
    await client.query(`
      DELETE FROM career_path_learning_resources
      WHERE career_path_option_id IN (
        SELECT id FROM career_path_options WHERE career_path_id = $1
      )
    `, [careerPathId]);
    
    // Delete all related skill gaps
    await client.query(`
      DELETE FROM career_path_skill_gaps
      WHERE career_path_option_id IN (
        SELECT id FROM career_path_options WHERE career_path_id = $1
      )
    `, [careerPathId]);
    
    // Delete all career path options
    await client.query(
      'DELETE FROM career_path_options WHERE career_path_id = $1',
      [careerPathId]
    );
    
    // Finally, delete the career path itself
    await client.query(
      'DELETE FROM user_career_paths WHERE id = $1',
      [careerPathId]
    );
    
    await client.query('COMMIT');
    
    console.log(`Career path ${careerPathId} deleted successfully for user ${userId}`);
    return res.json({ message: 'Career path deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting career path:', error);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
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
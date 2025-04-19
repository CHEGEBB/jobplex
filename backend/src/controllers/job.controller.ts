// src/controllers/job.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db.config';
import { CreateJobRequest, UpdateJobRequest } from '../types/job.types';

// Get all jobs (with filters)
export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      location, 
      jobType, 
      skill,
      page = '1', 
      limit = '10' 
    } = req.query;
    
    let query = `
      SELECT j.*, u.email AS employer_email,
      COALESCE(
          json_agg(
              json_build_object(
                  'skillName', js.skill_name,
                  'importance', js.importance
              )
          ) FILTER (WHERE js.skill_name IS NOT NULL), '[]'
      ) AS skills
      FROM jobs j
      LEFT JOIN users u ON j.employer_id = u.id
      LEFT JOIN job_skills js ON j.id = js.job_id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramCounter = 1;
    
    // Add filters to query
    if (title) {
      query += ` AND j.title ILIKE $${paramCounter}`;
      queryParams.push(`%${title}%`);
      paramCounter++;
    }
    
    if (location) {
      query += ` AND j.location ILIKE $${paramCounter}`;
      queryParams.push(`%${location}%`);
      paramCounter++;
    }
    
    if (jobType) {
      query += ` AND j.job_type = $${paramCounter}`;
      queryParams.push(jobType);
      paramCounter++;
    }
    
    query += ` GROUP BY j.id, u.email`;
    
    // Filter by skill if provided
    if (skill) {
      query = `
        SELECT * FROM (${query}) AS jobs_with_skills
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(jobs_with_skills.skills) AS skill
          WHERE skill->>'skillName' ILIKE $${paramCounter}
        )
      `;
      queryParams.push(`%${skill}%`);
      paramCounter++;
    }
    
    // Add sorting
    query += ` ORDER BY created_at DESC`;
    
    // Add pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    query += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    queryParams.push(limitNum, offset);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) FROM jobs j
      WHERE 1=1
    `;
    
    const countParams: any[] = [];
    let countParamCounter = 1;
    
    if (title) {
      countQuery += ` AND j.title ILIKE $${countParamCounter}`;
      countParams.push(`%${title}%`);
      countParamCounter++;
    }
    
    if (location) {
      countQuery += ` AND j.location ILIKE $${countParamCounter}`;
      countParams.push(`%${location}%`);
      countParamCounter++;
    }
    
    if (jobType) {
      countQuery += ` AND j.job_type = $${countParamCounter}`;
      countParams.push(jobType);
      countParamCounter++;
    }
    
    // Execute the queries
    const [jobsResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, countParams)
    ]);
    
    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limitNum);
    
    res.json({
      jobs: jobsResult.rows,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get job by ID
export const getJobById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const jobQuery = `
      SELECT j.*, u.email AS employer_email,
      COALESCE(
          json_agg(
              json_build_object(
                  'skillName', js.skill_name,
                  'importance', js.importance
              )
          ) FILTER (WHERE js.skill_name IS NOT NULL), '[]'
      ) AS skills
      FROM jobs j
      LEFT JOIN users u ON j.employer_id = u.id
      LEFT JOIN job_skills js ON j.id = js.job_id
      WHERE j.id = $1
      GROUP BY j.id, u.email
    `;
    
    const result = await pool.query(jobQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new job (employer only)
export const createJob = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { 
    title, 
    description, 
    location, 
    salaryRange, 
    jobType,
    skills 
  }: CreateJobRequest = req.body;
  
  // Validate required fields
  if (!title || !description || !jobType) {
    return res.status(400).json({ message: 'Title, description, and job type are required' });
  }
  
  // Validate job type
  const validJobTypes = ['full-time', 'part-time', 'contract', 'internship'];
  if (!validJobTypes.includes(jobType)) {
    return res.status(400).json({ 
      message: `Job type must be one of: ${validJobTypes.join(', ')}` 
    });
  }
  
  // Validate skills if present
  if (skills) {
    const validImportance = ['required', 'preferred', 'nice-to-have'];
    for (const skill of skills) {
      if (!skill.skillName) {
        return res.status(400).json({ message: 'Each skill must have a skillName' });
      }
      
      if (!validImportance.includes(skill.importance)) {
        return res.status(400).json({ 
          message: `Skill importance must be one of: ${validImportance.join(', ')}` 
        });
      }
    }
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert job
    const jobResult = await client.query(
      `INSERT INTO jobs (
        employer_id, title, description, location, salary_range, job_type
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, title, description, location, salaryRange, jobType]
    );
    
    const job = jobResult.rows[0];
    
    // Insert job skills if provided
    if (skills && skills.length > 0) {
      const skillValues = skills.map(skill => 
        `(${job.id}, '${skill.skillName.replace(/'/g, "''")}', '${skill.importance}')`
      ).join(', ');
      
      await client.query(`
        INSERT INTO job_skills (job_id, skill_name, importance)
        VALUES ${skillValues}
      `);
    }
    
    await client.query('COMMIT');
    
    // Get the job with skills
    const completeJobQuery = `
      SELECT j.*, 
      COALESCE(
          json_agg(
              json_build_object(
                  'skillName', js.skill_name,
                  'importance', js.importance
              )
          ) FILTER (WHERE js.skill_name IS NOT NULL), '[]'
      ) AS skills
      FROM jobs j
      LEFT JOIN job_skills js ON j.id = js.job_id
      WHERE j.id = $1
      GROUP BY j.id
    `;
    
    const completeJob = await pool.query(completeJobQuery, [job.id]);
    
    res.status(201).json(completeJob.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

// Update job (employer who created it only)
export const updateJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const { 
    title, 
    description, 
    location, 
    salaryRange, 
    jobType,
    skills 
  }: UpdateJobRequest = req.body;
  
  // Validate that at least one field is being updated
  if (!title && !description && !location && !salaryRange && !jobType && !skills) {
    return res.status(400).json({ message: 'No update fields provided' });
  }
  
  // Validate job type if provided
  if (jobType) {
    const validJobTypes = ['full-time', 'part-time', 'contract', 'internship'];
    if (!validJobTypes.includes(jobType)) {
      return res.status(400).json({ 
        message: `Job type must be one of: ${validJobTypes.join(', ')}` 
      });
    }
  }
  
  // Validate skills if present
  if (skills) {
    const validImportance = ['required', 'preferred', 'nice-to-have'];
    for (const skill of skills) {
      if (!skill.skillName) {
        return res.status(400).json({ message: 'Each skill must have a skillName' });
      }
      
      if (!validImportance.includes(skill.importance)) {
        return res.status(400).json({ 
          message: `Skill importance must be one of: ${validImportance.join(', ')}` 
        });
      }
    }
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if job exists and belongs to the user
    const jobCheck = await client.query(
      'SELECT * FROM jobs WHERE id = $1',
      [id]
    );
    
    if (jobCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (jobCheck.rows[0].employer_id !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'You can only update your own job listings' });
    }
    
    // Update job
    const updateResult = await client.query(
      `UPDATE jobs 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           location = COALESCE($3, location),
           salary_range = COALESCE($4, salary_range),
           job_type = COALESCE($5, job_type),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND employer_id = $7
       RETURNING *`,
      [title, description, location, salaryRange, jobType, id, userId]
    );
    
    // Update skills if provided
    if (skills) {
      // Delete existing skills
      await client.query('DELETE FROM job_skills WHERE job_id = $1', [id]);
      
      // Insert new skills
      if (skills.length > 0) {
        const skillValues = skills.map(skill => 
          `(${id}, '${skill.skillName.replace(/'/g, "''")}', '${skill.importance}')`
        ).join(', ');
        
        await client.query(`
          INSERT INTO job_skills (job_id, skill_name, importance)
          VALUES ${skillValues}
        `);
      }
    }
    
    await client.query('COMMIT');
    
    // Get the updated job with skills
    const completeJobQuery = `
      SELECT j.*, 
      COALESCE(
          json_agg(
              json_build_object(
                  'skillName', js.skill_name,
                  'importance', js.importance
              )
          ) FILTER (WHERE js.skill_name IS NOT NULL), '[]'
      ) AS skills
      FROM jobs j
      LEFT JOIN job_skills js ON j.id = js.job_id
      WHERE j.id = $1
      GROUP BY j.id
    `;
    
    const completeJob = await pool.query(completeJobQuery, [id]);
    
    res.json(completeJob.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

// Delete job (employer who created it only)
export const deleteJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  
  try {
    // Check if job exists and belongs to the user
    const jobCheck = await pool.query(
      'SELECT * FROM jobs WHERE id = $1',
      [id]
    );
    
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (jobCheck.rows[0].employer_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own job listings' });
    }
    
    // Delete job (will cascade to job_skills due to foreign key constraints)
    await pool.query('DELETE FROM jobs WHERE id = $1 AND employer_id = $2', [id, userId]);
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply for a job (job seeker only)
export const applyForJob = async (req: Request, res: Response) => {
  const { id: jobId } = req.params;
  const userId = req.user?.id;
  
  try {
    // Check if job exists
    const jobCheck = await pool.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if user has already applied
    const applicationCheck = await pool.query(
      'SELECT * FROM applications WHERE job_id = $1 AND user_id = $2',
      [jobId, userId]
    );
    
    if (applicationCheck.rows.length > 0) {
      return res.status(409).json({ message: 'You have already applied for this job' });
    }
    
    // Create application
    const applicationResult = await pool.query(
      'INSERT INTO applications (job_id, user_id, status) VALUES ($1, $2, $3) RETURNING *',
      [jobId, userId, 'pending']
    );
    
    res.status(201).json({
      message: 'Application submitted successfully',
      application: applicationResult.rows[0]
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get job matches based on skills (job seeker only)
export const getJobMatches = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  try {
    // Get user skills
    const userSkills = await pool.query(
      'SELECT name FROM skills WHERE user_id = $1',
      [userId]
    );
    
    if (userSkills.rows.length === 0) {
      return res.json({
        matches: [],
        message: 'Add skills to your profile to see job matches'
      });
    }
    
    const skillNames = userSkills.rows.map(skill => skill.name);
    
    // Find jobs with matching skills
    const matchesQuery = `
      SELECT j.*, 
      COALESCE(
          json_agg(
              json_build_object(
                  'skillName', js.skill_name,
                  'importance', js.importance
              )
          ) FILTER (WHERE js.skill_name IS NOT NULL), '[]'
      ) AS skills,
      COUNT(DISTINCT CASE WHEN LOWER(js.skill_name) IN (${skillNames.map(s => `LOWER('${s.replace(/'/g, "''")}')`).join(',')}) THEN js.skill_name END) AS matching_skills_count
      FROM jobs j
      LEFT JOIN job_skills js ON j.id = js.job_id
      WHERE EXISTS (
        SELECT 1 FROM job_skills js2
        WHERE js2.job_id = j.id
        AND LOWER(js2.skill_name) IN (${skillNames.map(s => `LOWER('${s.replace(/'/g, "''")}')`).join(',')})
      )
      GROUP BY j.id
      ORDER BY matching_skills_count DESC, j.created_at DESC
    `;
    
    const matches = await pool.query(matchesQuery);
    
    res.json({
      matches: matches.rows,
      userSkills: skillNames,
      totalMatches: matches.rows.length
    });
  } catch (error) {
    console.error('Error getting job matches:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
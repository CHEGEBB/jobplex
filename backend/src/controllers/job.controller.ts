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
      ) AS skills,
      (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applications_count,
      (SELECT COUNT(*) FROM job_views jv WHERE jv.job_id = j.id) AS views
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

// Get employer's own jobs
export const getEmployerJobs = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  try {
    const jobsQuery = `
      SELECT j.*,
      COALESCE(
          json_agg(
              json_build_object(
                  'skillName', js.skill_name,
                  'importance', js.importance
              )
          ) FILTER (WHERE js.skill_name IS NOT NULL), '[]'
      ) AS skills,
      (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applications_count,
      (SELECT COUNT(*) FROM job_views jv WHERE jv.job_id = j.id) AS views,
      (
        SELECT COUNT(DISTINCT a.user_id) 
        FROM applications a 
        WHERE a.job_id = j.id AND a.match_score >= 70
      ) AS matches_count
      FROM jobs j
      LEFT JOIN job_skills js ON j.id = js.job_id
      WHERE j.employer_id = $1
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `;
    
    const jobsResult = await pool.query(jobsQuery, [userId]);
    
    res.json(jobsResult.rows);
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
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
      ) AS skills,
      (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applications_count,
      (SELECT COUNT(*) FROM job_views jv WHERE jv.job_id = j.id) AS views
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
    
    // Increment view count if user is not the employer
    const userId = req.user?.id;
    if (userId && userId !== result.rows[0].employer_id) {
      await pool.query(
        `INSERT INTO job_views (job_id, user_id) 
         VALUES ($1, $2) 
         ON CONFLICT (job_id, user_id) DO NOTHING`,
        [id, userId]
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new job (employer only)
export const createJob = async (req: Request, res: Response) => {
  console.log('Request user:', req.user);
  console.log('Request body:', req.body);
  const userId = req.user?.id;
  const { 
    title, 
    description, 
    location, 
    salary_range, 
    job_type,
    status = 'draft',
    department,
    work_mode,
    experience_level,
    education_level,
    requirements,
    benefits,
    deadline_date: rawDeadlineDate,
    min_salary,
    max_salary,
    salary_visible = true,
    skills,
    screening_questions,
    internal = true,
    career_site = true,
    linkedin = false,
    indeed = false,
    team_access = 'all',
    scheduled_date
  } = req.body;

  const deadline_date = rawDeadlineDate === '' ? null : rawDeadlineDate;
  
  // Validate required fields
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }
  
  // Validate job type
  const validJobTypes = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
  if (job_type && !validJobTypes.includes(job_type.toLowerCase())) {
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
      
      if (skill.importance && !validImportance.includes(skill.importance)) {
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
    const jobResult = // Modify the INSERT parameters to use sanitized values
    await client.query(
      `INSERT INTO jobs (
        employer_id, title, description, location, salary_range, job_type,
        status, department, work_mode, experience_level, education_level,
        requirements, benefits, deadline_date, min_salary, max_salary,
        salary_visible, internal, career_site, linkedin, indeed,
        team_access, scheduled_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) 
      RETURNING *`,
      [
        userId, title, description, location, salary_range, job_type,
        status, department, work_mode, experience_level, education_level,
        requirements || null,  // Handle empty strings for nullable fields
        benefits || null,
        deadline_date, 
        min_salary, 
        max_salary,
        salary_visible, 
        internal, 
        career_site, 
        linkedin, 
        indeed,
        team_access, 
        scheduled_date
      ]
    );
    
    const job = jobResult.rows[0];
    
    // Insert job skills if provided
    if (skills && skills.length > 0) {
      interface Skill {
        skillName: string;
        importance?: 'required' | 'preferred' | 'nice-to-have';
      }

      const skillValues = skills.map((skill: Skill) => 
        `(${job.id}, '${skill.skillName.replace(/'/g, "''")}', '${skill.importance || 'required'}')`
      ).join(', ');
      
      await client.query(`
        INSERT INTO job_skills (job_id, skill_name, importance)
        VALUES ${skillValues}
      `);
    }
    
    // Insert screening questions if provided
    if (screening_questions && screening_questions.length > 0) {
      for (const question of screening_questions) {
        await client.query(
          `INSERT INTO screening_questions (
            job_id, question_text, question_type, options, is_required
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            job.id,
            question.question,
            question.type || 'text',
            question.options ? JSON.stringify(question.options.split('\n')) : null,
            question.required || false
          ]
        );
      }
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
      ) AS skills,
      (
        SELECT json_agg(
          json_build_object(
            'id', sq.id,
            'question', sq.question_text,
            'type', sq.question_type,
            'options', sq.options,
            'required', sq.is_required
          )
        )
        FROM screening_questions sq
        WHERE sq.job_id = j.id
      ) AS screening_questions
      FROM jobs j
      LEFT JOIN job_skills js ON j.id = js.job_id
      WHERE j.id = $1
      GROUP BY j.id
    `;
    
    const completeJob = await pool.query(completeJobQuery, [job.id]);
    
    res.status(201).json(completeJob.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof Error) {
      console.error('Error creating job:', error.stack); // Log detailed error
    } else {
      console.error('Error creating job:', error); // Log generic error
    }
    res.status(500).json({ 
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error' // Safely handle unknown error type
    });
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
    salary_range, 
    job_type,
    status,
    department,
    work_mode,
    experience_level,
    education_level,
    requirements,
    benefits,
    deadline_date,
    min_salary,
    max_salary,
    salary_visible,
    skills,
    screening_questions,
    internal,
    career_site,
    linkedin,
    indeed,
    team_access,
    scheduled_date
  } = req.body;
  
  // Validate job type if provided
  if (job_type) {
    const validJobTypes = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
    if (!validJobTypes.includes(job_type.toLowerCase())) {
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
      
      if (skill.importance && !validImportance.includes(skill.importance)) {
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
    
    // Build dynamic update query
    let updateQuery = 'UPDATE jobs SET updated_at = CURRENT_TIMESTAMP';
    const updateValues = [];
    let valueIndex = 1;
    
    if (title !== undefined) {
      updateQuery += `, title = $${valueIndex}`;
      updateValues.push(title);
      valueIndex++;
    }
    
    if (description !== undefined) {
      updateQuery += `, description = $${valueIndex}`;
      updateValues.push(description);
      valueIndex++;
    }
    
    if (location !== undefined) {
      updateQuery += `, location = $${valueIndex}`;
      updateValues.push(location);
      valueIndex++;
    }
    
    if (salary_range !== undefined) {
      updateQuery += `, salary_range = $${valueIndex}`;
      updateValues.push(salary_range);
      valueIndex++;
    }
    
    if (job_type !== undefined) {
      updateQuery += `, job_type = $${valueIndex}`;
      updateValues.push(job_type);
      valueIndex++;
    }
    
    if (status !== undefined) {
      updateQuery += `, status = $${valueIndex}`;
      updateValues.push(status);
      valueIndex++;
    }
    
    if (department !== undefined) {
      updateQuery += `, department = $${valueIndex}`;
      updateValues.push(department);
      valueIndex++;
    }
    
    if (work_mode !== undefined) {
      updateQuery += `, work_mode = $${valueIndex}`;
      updateValues.push(work_mode);
      valueIndex++;
    }
    
    if (experience_level !== undefined) {
      updateQuery += `, experience_level = $${valueIndex}`;
      updateValues.push(experience_level);
      valueIndex++;
    }
    
    if (education_level !== undefined) {
      updateQuery += `, education_level = $${valueIndex}`;
      updateValues.push(education_level);
      valueIndex++;
    }
    
    if (requirements !== undefined) {
      updateQuery += `, requirements = $${valueIndex}`;
      updateValues.push(requirements);
      valueIndex++;
    }
    
    if (benefits !== undefined) {
      updateQuery += `, benefits = $${valueIndex}`;
      updateValues.push(benefits);
      valueIndex++;
    }
    
    if (deadline_date !== undefined) {
      updateQuery += `, deadline_date = $${valueIndex}`;
      updateValues.push(deadline_date);
      valueIndex++;
    }
    
    if (min_salary !== undefined) {
      updateQuery += `, min_salary = $${valueIndex}`;
      updateValues.push(min_salary);
      valueIndex++;
    }
    
    if (max_salary !== undefined) {
      updateQuery += `, max_salary = $${valueIndex}`;
      updateValues.push(max_salary);
      valueIndex++;
    }
    
    if (salary_visible !== undefined) {
      updateQuery += `, salary_visible = $${valueIndex}`;
      updateValues.push(salary_visible);
      valueIndex++;
    }
    
    if (internal !== undefined) {
      updateQuery += `, internal = $${valueIndex}`;
      updateValues.push(internal);
      valueIndex++;
    }
    
    if (career_site !== undefined) {
      updateQuery += `, career_site = $${valueIndex}`;
      updateValues.push(career_site);
      valueIndex++;
    }
    
    if (linkedin !== undefined) {
      updateQuery += `, linkedin = $${valueIndex}`;
      updateValues.push(linkedin);
      valueIndex++;
    }
    
    if (indeed !== undefined) {
      updateQuery += `, indeed = $${valueIndex}`;
      updateValues.push(indeed);
      valueIndex++;
    }
    
    if (team_access !== undefined) {
      updateQuery += `, team_access = $${valueIndex}`;
      updateValues.push(team_access);
      valueIndex++;
    }
    
    if (scheduled_date !== undefined) {
      updateQuery += `, scheduled_date = $${valueIndex}`;
      updateValues.push(scheduled_date);
      valueIndex++;
    }
    
    // Add WHERE clause
    updateQuery += ` WHERE id = $${valueIndex} AND employer_id = $${valueIndex + 1} RETURNING *`;
    updateValues.push(id, userId);
    
    // Execute update
    const updateResult = await client.query(updateQuery, updateValues);
    
    // Update skills if provided
    if (skills) {
      // Delete existing skills
      await client.query('DELETE FROM job_skills WHERE job_id = $1', [id]);
      
      // Insert new skills
      if (skills.length > 0) {
        interface Skill {
          skillName: string;
          importance?: 'required' | 'preferred' | 'nice-to-have';
        }

        const skillValues: string = skills.map((skill: Skill) => 
          `(${id}, '${skill.skillName.replace(/'/g, "''")}', '${skill.importance || 'required'}')`
        ).join(', ');
        
        await client.query(`
          INSERT INTO job_skills (job_id, skill_name, importance)
          VALUES ${skillValues}
        `);
      }
    }
    
    // Update screening questions if provided
    if (screening_questions) {
      // Delete existing questions
      await client.query('DELETE FROM screening_questions WHERE job_id = $1', [id]);
      
      // Insert new questions
      if (screening_questions.length > 0) {
        for (const question of screening_questions) {
          await client.query(
            `INSERT INTO screening_questions (
              job_id, question_text, question_type, options, is_required
            ) VALUES ($1, $2, $3, $4, $5)`,
            [
              id,
              question.question,
              question.type || 'text',
              question.options ? JSON.stringify(question.options.split('\n')) : null,
              question.required || false
            ]
          );
        }
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
      ) AS skills,
      (
        SELECT json_agg(
          json_build_object(
            'id', sq.id,
            'question', sq.question_text,
            'type', sq.question_type,
            'options', sq.options,
            'required', sq.is_required
          )
        )
        FROM screening_questions sq
        WHERE sq.job_id = j.id
      ) AS screening_questions
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

// Update job status (active/closed/archived)
export const updateJobStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const { status } = req.body;
  
  if (!status || !['active', 'draft', 'closed', 'archived'].includes(status)) {
    return res.status(400).json({ message: 'Valid status is required (active, draft, closed, or archived)' });
  }
  
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
      return res.status(403).json({ message: 'You can only update your own job listings' });
    }
    
    // Update status
    const updateResult = await pool.query(
      `UPDATE jobs SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND employer_id = $3 RETURNING *`,
      [status, id, userId]
    );
    
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
    console.error('Error updating job status:', error);
    res.status(500).json({ message: 'Server error' });
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
    
    // Calculate match score based on user skills and job requirements
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required to apply for a job' });
    }
    const matchScore = await calculateMatchScore(Number(userId), Number(jobId));
    
    // Create application
    const applicationResult = await pool.query(
      'INSERT INTO applications (job_id, user_id, status, match_score) VALUES ($1, $2, $3, $4) RETURNING *',
      [jobId, userId, 'pending', matchScore]
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
        userSkills: [],
        totalMatches: 0,
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
      COUNT(DISTINCT CASE WHEN LOWER(js.skill_name) IN (${skillNames.map(s => `LOWER('${s.replace(/'/g, "''")}')`).join(',')}) THEN js.skill_name END) AS matching_skills_count,
      (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applications_count,
      (SELECT COUNT(*) FROM job_views jv WHERE jv.job_id = j.id) AS views
      FROM jobs j
      LEFT JOIN job_skills js ON j.id = js.job_id
      WHERE j.status = 'active' AND EXISTS (
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

// Helper function to calculate match score
async function calculateMatchScore(userId: number, jobId: number): Promise<number> {
  try {
    // Get user skills
    const userSkills = await pool.query(
      'SELECT name, proficiency FROM skills WHERE user_id = $1',
      [userId]
    );
    
    // Get job skills
    const jobSkills = await pool.query(
      'SELECT skill_name, importance FROM job_skills WHERE job_id = $1',
      [jobId]
    );
    
    if (jobSkills.rows.length === 0) {
      return 50; // Default score if job has no skills listed
    }
    
    // Convert to lowercase for case-insensitive matching
    const userSkillMap = new Map();
    userSkills.rows.forEach(skill => {
      userSkillMap.set(skill.name.toLowerCase(), skill.proficiency);
    });
    
    let totalPoints = 0;
    let maxPoints = 0;
    
    jobSkills.rows.forEach(jobSkill => {
      const skillName = jobSkill.skill_name.toLowerCase();
      const importance = jobSkill.importance;
      
      // Assign weight based on importance
      let weight = 1;
      if (importance === 'required') weight = 3;
      else if (importance === 'preferred') weight = 2;
      
      maxPoints += weight * 3; // Maximum points per skill
      
      if (userSkillMap.has(skillName)) {
        const proficiency = userSkillMap.get(skillName);
        
        // Assign points based on proficiency
        let proficiencyPoints = 1;
        if (proficiency === 'expert') proficiencyPoints = 3;
        else if (proficiency === 'advanced') proficiencyPoints = 2.5;
        else if (proficiency === 'intermediate') proficiencyPoints = 2;
        
        totalPoints += weight * proficiencyPoints;
      }
    });
    
    // Calculate percentage match score
    const matchScore = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 50;
    
    return Math.min(100, matchScore); // Cap at 100%
  } catch (error) {
    console.error('Error calculating match score:', error);
    return 50; // Default score on error
  }
}
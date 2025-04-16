"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_config_1 = require("../config/db.config");
class JobService {
    async createJob(jobData, skills = []) {
        // Create a client to use for transaction
        const client = await db_config_1.pool.connect();
        try {
            // Start transaction
            await client.query('BEGIN');
            // Create the job
            const jobResult = await client.query(`INSERT INTO jobs (title, description, company, location, salary, employer_id, 
                          employment_type, experience_level, status, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) 
         RETURNING *`, [
                jobData.title,
                jobData.description,
                jobData.company,
                jobData.location,
                jobData.salary || null,
                jobData.employerId,
                jobData.employmentType,
                jobData.experienceLevel,
                jobData.status || 'open'
            ]);
            const job = jobResult.rows[0];
            // Add job skills if provided
            if (skills.length > 0) {
                for (const skillId of skills) {
                    await client.query('INSERT INTO job_skills (job_id, skill_id, importance, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())', [job.id, skillId, 1] // Default importance
                    );
                }
            }
            // Get skill names for response
            const skillNamesResult = await client.query(`SELECT s.name 
         FROM skills s 
         JOIN job_skills js ON s.id = js.skill_id 
         WHERE js.job_id = $1`, [job.id]);
            // Commit transaction
            await client.query('COMMIT');
            // Transform data for response
            return {
                id: job.id,
                title: job.title,
                description: job.description,
                company: job.company,
                location: job.location,
                salary: job.salary,
                employerId: job.employer_id,
                employmentType: job.employment_type,
                experienceLevel: job.experience_level,
                status: job.status,
                createdAt: job.created_at,
                updatedAt: job.updated_at,
                skills: skillNamesResult.rows.map(row => row.name)
            };
        }
        catch (error) {
            // Rollback in case of error
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            // Release client
            client.release();
        }
    }
    async getJobById(id) {
        // Get job details
        const jobResult = await db_config_1.pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
        if (jobResult.rowCount === 0) {
            throw { statusCode: 404, message: 'Job not found' };
        }
        // Get skill names for the job
        const skillsResult = await db_config_1.pool.query(`SELECT s.name 
       FROM skills s 
       JOIN job_skills js ON s.id = js.skill_id 
       WHERE js.job_id = $1`, [id]);
        const job = jobResult.rows[0];
        return {
            id: job.id,
            title: job.title,
            description: job.description,
            company: job.company,
            location: job.location,
            salary: job.salary,
            employerId: job.employer_id,
            employmentType: job.employment_type,
            experienceLevel: job.experience_level,
            status: job.status,
            createdAt: job.created_at,
            updatedAt: job.updated_at,
            skills: skillsResult.rows.map(row => row.name)
        };
    }
    async getAllJobs(page = 1, limit = 10, status = 'open', search, location) {
        const offset = (page - 1) * limit;
        let whereConditions = ['status = $1'];
        let queryParams = [status];
        let paramCount = 2;
        // Add search filter if provided
        if (search) {
            whereConditions.push(`(title ILIKE $${paramCount} OR description ILIKE $${paramCount})`);
            queryParams.push(`%${search}%`);
            paramCount++;
        }
        // Add location filter if provided
        if (location) {
            whereConditions.push(`location ILIKE $${paramCount}`);
            queryParams.push(`%${location}%`);
            paramCount++;
        }
        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';
        // Get total count
        const countQuery = `SELECT COUNT(*) FROM jobs ${whereClause}`;
        const countResult = await db_config_1.pool.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].count);
        // Get paginated jobs
        const jobsQuery = `
      SELECT * FROM jobs 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
        const jobsResult = await db_config_1.pool.query(jobsQuery, [...queryParams, limit, offset]);
        // Get all job IDs to fetch skills in a single query
        const jobIds = jobsResult.rows.map(job => job.id);
        // Get skills for all jobs in a single query if there are jobs
        let skillsByJobId = {};
        if (jobIds.length > 0) {
            const skillsQuery = `
        SELECT js.job_id, s.name 
        FROM job_skills js
        JOIN skills s ON js.skill_id = s.id
        WHERE js.job_id = ANY($1)
      `;
            const skillsResult = await db_config_1.pool.query(skillsQuery, [jobIds]);
            // Group skills by job_id
            skillsResult.rows.forEach(row => {
                if (!skillsByJobId[row.job_id]) {
                    skillsByJobId[row.job_id] = [];
                }
                skillsByJobId[row.job_id].push(row.name);
            });
        }
        // Map job results with skills
        const jobs = jobsResult.rows.map(job => ({
            id: job.id,
            title: job.title,
            description: job.description,
            company: job.company,
            location: job.location,
            salary: job.salary,
            employerId: job.employer_id,
            employmentType: job.employment_type,
            experienceLevel: job.experience_level,
            status: job.status,
            createdAt: job.created_at,
            updatedAt: job.updated_at,
            skills: skillsByJobId[job.id] || []
        }));
        return { jobs, total };
    }
    async updateJob(id, jobData, skills) {
        const client = await db_config_1.pool.connect();
        try {
            await client.query('BEGIN');
            // First check if job exists and belongs to the employer
            const jobCheck = await client.query('SELECT * FROM jobs WHERE id = $1', [id]);
            if (jobCheck.rowCount === 0) {
                throw { statusCode: 404, message: 'Job not found' };
            }
            // Create an array to hold our query parts
            const updates = [];
            const values = [];
            let paramCount = 1;
            // Add all job data fields that are present
            if (jobData.title !== undefined) {
                updates.push(`title = $${paramCount++}`);
                values.push(jobData.title);
            }
            if (jobData.description !== undefined) {
                updates.push(`description = $${paramCount++}`);
                values.push(jobData.description);
            }
            if (jobData.company !== undefined) {
                updates.push(`company = $${paramCount++}`);
                values.push(jobData.company);
            }
            if (jobData.location !== undefined) {
                updates.push(`location = $${paramCount++}`);
                values.push(jobData.location);
            }
            if (jobData.salary !== undefined) {
                updates.push(`salary = $${paramCount++}`);
                values.push(jobData.salary);
            }
            if (jobData.employmentType !== undefined) {
                updates.push(`employment_type = $${paramCount++}`);
                values.push(jobData.employmentType);
            }
            if (jobData.experienceLevel !== undefined) {
                updates.push(`experience_level = $${paramCount++}`);
                values.push(jobData.experienceLevel);
            }
            if (jobData.status !== undefined) {
                updates.push(`status = $${paramCount++}`);
                values.push(jobData.status);
            }
            // Always update the updated_at timestamp
            updates.push(`updated_at = NOW()`);
            // Add the ID as the last parameter
            values.push(id);
            if (updates.length > 0) {
                await client.query(`UPDATE jobs SET ${updates.join(', ')} WHERE id = $${paramCount}`, values);
            }
            // Update skills if provided
            if (skills !== undefined) {
                // Remove existing job skills
                await client.query('DELETE FROM job_skills WHERE job_id = $1', [id]);
                // Add new job skills
                if (skills.length > 0) {
                    for (const skillId of skills) {
                        await client.query('INSERT INTO job_skills (job_id, skill_id, importance, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())', [id, skillId, 1] // Default importance
                        );
                    }
                }
            }
            // Get updated job
            const jobResult = await client.query('SELECT * FROM jobs WHERE id = $1', [id]);
            // Get skill names for response
            const skillNamesResult = await client.query(`SELECT s.name 
         FROM skills s 
         JOIN job_skills js ON s.id = js.skill_id 
         WHERE js.job_id = $1`, [id]);
            await client.query('COMMIT');
            const job = jobResult.rows[0];
            return {
                id: job.id,
                title: job.title,
                description: job.description,
                company: job.company,
                location: job.location,
                salary: job.salary,
                employerId: job.employer_id,
                employmentType: job.employment_type,
                experienceLevel: job.experience_level,
                status: job.status,
                createdAt: job.created_at,
                updatedAt: job.updated_at,
                skills: skillNamesResult.rows.map(row => row.name)
            };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async deleteJob(id) {
        const client = await db_config_1.pool.connect();
        try {
            await client.query('BEGIN');
            // First check if job exists
            const jobCheck = await client.query('SELECT * FROM jobs WHERE id = $1', [id]);
            if (jobCheck.rowCount === 0) {
                throw { statusCode: 404, message: 'Job not found' };
            }
            // Delete job skills first (foreign key constraint)
            await client.query('DELETE FROM job_skills WHERE job_id = $1', [id]);
            // Delete job applications (foreign key constraint)
            await client.query('DELETE FROM applications WHERE job_id = $1', [id]);
            // Delete the job
            await client.query('DELETE FROM jobs WHERE id = $1', [id]);
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
}
exports.default = new JobService();

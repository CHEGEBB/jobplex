import { Request, Response } from 'express';
import jobService from '../services/job.service';
import { IJob } from '../interfaces/job.interface';
import { UserRole } from '../interfaces/user.interface';

export class JobController {
  async createJob(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Not authenticated' 
        });
      }

      if (req.user?.role !== UserRole.EMPLOYER) {
        return res.status(403).json({
          success: false,
          message: 'Only employers can create jobs'
        });
      }

      const jobData: IJob = {
        title: req.body.title,
        description: req.body.description,
        company: req.body.company,
        location: req.body.location,
        salary: req.body.salary,
        employerId: userId,
        employmentType: req.body.employmentType,
        experienceLevel: req.body.experienceLevel,
        status: req.body.status || 'open'
      };

      const skills = req.body.skills || [];
      const job = await jobService.createJob(jobData, skills);
      
      res.status(201).json({ success: true, data: job });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error creating job' 
      });
    }
  }

  async getJobById(req: Request, res: Response) {
    try {
      const jobId = parseInt(req.params.id);
      const job = await jobService.getJobById(jobId);
      res.status(200).json({ success: true, data: job });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error fetching job' 
      });
    }
  }

  async getAllJobs(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string || 'open';
      const search = req.query.search as string;
      const location = req.query.location as string;
      
      const result = await jobService.getAllJobs(page, limit, status, search, location);
      
      res.status(200).json({ 
        success: true, 
        data: result.jobs,
        meta: {
          total: result.total,
          page,
          limit,
          pages: Math.ceil(result.total / limit)
        }
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error fetching jobs' 
      });
    }
  }

  async updateJob(req: Request, res: Response) {
    try {
      const jobId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Not authenticated' 
        });
      }

      const jobData: Partial<IJob> = {};
      
      if (req.body.title !== undefined) jobData.title = req.body.title;
      if (req.body.description !== undefined) jobData.description = req.body.description;
      if (req.body.company !== undefined) jobData.company = req.body.company;
      if (req.body.location !== undefined) jobData.location = req.body.location;
      if (req.body.salary !== undefined) jobData.salary = req.body.salary;
      if (req.body.employmentType !== undefined) jobData.employmentType = req.body.employmentType;
      if (req.body.experienceLevel !== undefined) jobData.experienceLevel = req.body.experienceLevel;
      if (req.body.status !== undefined) jobData.status = req.body.status;

      const skills = req.body.skills !== undefined ? req.body.skills : undefined;
      
      const updatedJob = await jobService.updateJob(jobId, jobData, skills);
      res.status(200).json({ success: true, data: updatedJob });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error updating job' 
      });
    }
  }

  async deleteJob(req: Request, res: Response) {
    try {
      const jobId = parseInt(req.params.id);
      await jobService.deleteJob(jobId);
      res.status(200).json({ 
        success: true, 
        message: 'Job deleted successfully' 
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error deleting job' 
      });
    }
  }
}

export default new JobController();
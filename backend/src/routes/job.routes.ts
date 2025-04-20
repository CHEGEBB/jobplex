// src/routes/job.routes.ts
import express from 'express';
import { 
  getAllJobs, 
  getEmployerJobs,
  getJobById, 
  createJob, 
  updateJob, 
  updateJobStatus,
  deleteJob,
  applyForJob,
  getJobMatches
} from '../controllers/job.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { isEmployer, isJobSeeker } from '../middleware/role.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Employer routes
router.get('/employer/me', verifyToken, isEmployer, getEmployerJobs);
router.post('/', verifyToken, isEmployer, createJob);
router.put('/:id', verifyToken, isEmployer, updateJob);
router.patch('/:id/status', verifyToken, isEmployer, updateJobStatus);
router.delete('/:id', verifyToken, isEmployer, deleteJob);

// Job seeker routes
router.post('/:id/apply', verifyToken, isJobSeeker, applyForJob);
router.get('/matches/me', verifyToken, isJobSeeker, getJobMatches);

export default router;
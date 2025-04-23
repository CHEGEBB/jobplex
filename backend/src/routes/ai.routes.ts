import express from 'express';
import { 
  getCareerPathRecommendations, 
  matchCandidatesToJob,
  generateJobDescription,
  analyzeResume
} from '../controllers/ai.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { isJobSeeker, isEmployer } from '../middleware/role.middleware';

const router = express.Router();

// Job seeker routes
router.get('/career-path', verifyToken, isJobSeeker, getCareerPathRecommendations);
router.post('/analyze-resume', verifyToken, isJobSeeker, analyzeResume);

// Employer routes
router.get('/match-candidates/:jobId', verifyToken, isEmployer, matchCandidatesToJob);
router.post('/generate-job-description', verifyToken, isEmployer, generateJobDescription);

export default router;
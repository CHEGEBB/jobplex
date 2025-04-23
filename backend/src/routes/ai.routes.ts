// src/routes/ai.routes.ts
import express from 'express';
import { 
  getCareerPathRecommendations, 
  matchCandidates, 
  getSavedCareerPaths, 
  deleteCareerPath 
} from '../controllers/ai.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { isJobSeeker, isEmployer } from '../middleware/role.middleware';

const router = express.Router();

// Job seeker routes
router.get('/career-path', verifyToken, isJobSeeker, getCareerPathRecommendations);
router.get('/career-paths', verifyToken, isJobSeeker, getSavedCareerPaths);
router.delete('/career-path/:careerPathId', verifyToken, isJobSeeker, deleteCareerPath);

// Employer routes
router.get('/match-candidates/:jobId', verifyToken, isEmployer, matchCandidates);

export default router;
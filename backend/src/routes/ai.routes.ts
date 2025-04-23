// src/routes/ai.routes.ts
import express from 'express';
import { 
  getCareerPathRecommendations,
  getSavedCareerPaths,
  deleteCareerPath,
  matchCandidates,
  employerChatQuery,
  getSavedChatQueries,
  deleteChatQuery
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
router.post('/employer-chat', verifyToken, isEmployer, employerChatQuery);
router.get('/saved-queries', verifyToken, isEmployer, getSavedChatQueries);
router.delete('/saved-query/:queryId', verifyToken, isEmployer, deleteChatQuery);

export default router;
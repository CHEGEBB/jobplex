// src/routes/profile.routes.ts
import express from 'express';
import { 
  getProfile, updateProfile, uploadProfilePhoto,
  addSkill, removeSkill,
  addExperience, updateExperience, deleteExperience,
  addEducation, updateEducation, deleteEducation,
  uploadDocument, deleteDocument
} from '../controllers/profile.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { isJobSeeker } from '../middleware/role.middleware';

const router = express.Router();

// Apply job seeker role check to all profile routes
router.use(verifyToken, isJobSeeker);

// Profile routes
router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/photo', uploadProfilePhoto);

// Skill routes
router.post('/skills', addSkill);
router.delete('/skills/:id', removeSkill);

// Experience routes
router.post('/experience', addExperience);
router.put('/experience/:id', updateExperience);
router.delete('/experience/:id', deleteExperience);

// Education routes
router.post('/education', addEducation);
router.put('/education/:id', updateEducation);
router.delete('/education/:id', deleteEducation);

// Document routes
router.post('/documents', uploadDocument);
router.delete('/documents/:id', deleteDocument);

export default router;



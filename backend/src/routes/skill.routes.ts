// src/routes/skill.routes.ts
import express from 'express';
import { 
  getAllSkills, 
  getSkillById, 
  createSkill, 
  updateSkill, 
  deleteSkill,
  getUserSkills
} from '../controllers/skill.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { isJobSeeker } from '../middleware/role.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllSkills);
router.get('/:id', getSkillById);

// Protected routes for job seekers
router.get('/user/me', isJobSeeker, getUserSkills);
router.post('/', isJobSeeker, createSkill);
router.put('/:id', isJobSeeker, updateSkill);
router.delete('/:id', isJobSeeker, deleteSkill);

export default router;
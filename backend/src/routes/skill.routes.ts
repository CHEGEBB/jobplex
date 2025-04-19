// src/routes/skill.routes.ts
import { Router } from 'express';
import skillController from '../controllers/skill.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all skills for the authenticated user
router.get('/', skillController.getUserSkills);

// Get skills by category
router.get('/category/:category', skillController.getUserSkillsByCategory);

// Get a specific skill by ID
router.get('/:id', skillController.getSkillById);

// Create a new skill
router.post('/', skillController.createSkill);

// Update an existing skill
router.put('/:id', skillController.updateSkill);

// Delete a skill
router.delete('/:id', skillController.deleteSkill);

export default router;
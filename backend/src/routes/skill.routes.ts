import { Router } from 'express';
import skillController from '../controllers/skill.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { UserRole } from '../interfaces/user.interface';

const router = Router();

/**
 * @route   POST /api/skills
 * @desc    Create a new skill
 * @access  Private/Admin
 */
router.post('/', authenticateToken, authorizeRoles(UserRole.ADMIN), skillController.createSkill);

/**
 * @route   GET /api/skills
 * @desc    Get all skills
 * @access  Public
 */
router.get('/', skillController.getAllSkills);

/**
 * @route   GET /api/skills/:id
 * @desc    Get skill by ID
 * @access  Public
 */
router.get('/:id', skillController.getSkillById);

/**
 * @route   POST /api/skills/user
 * @desc    Add a skill to current user
 * @access  Private
 */
router.post('/user', authenticateToken, skillController.addUserSkill);

/**
 * @route   GET /api/skills/user/:userId
 * @desc    Get skills for a specific user
 * @access  Public
 */
router.get('/user/:userId', skillController.getUserSkills);

/**
 * @route   DELETE /api/skills/user/:skillId
 * @desc    Remove a skill from current user
 * @access  Private
 */
router.delete('/user/:skillId', authenticateToken, skillController.removeUserSkill);

export default router;
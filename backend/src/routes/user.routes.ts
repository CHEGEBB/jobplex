import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { UserRole } from '../interfaces/user.interface';

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateToken, userController.getCurrentUser);

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', authenticateToken, userController.updateUser);

/**
 * @route   GET /api/users
 * @desc    Get all users (paginated)
 * @access  Private/Admin
 */
router.get('/', authenticateToken, authorizeRoles(UserRole.ADMIN), userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private/Admin
 */
router.get('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), userController.getUserById);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), userController.deleteUser);

export default router;
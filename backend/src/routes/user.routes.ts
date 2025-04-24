// src/routes/user.routes.ts
import express from 'express';
import { 
  getCurrentUser, 
  updateCurrentUser, 
  getUserById, 
  updateUserById, 
  deleteUserById, 
  getAllUsers,
  changeUserRole,
  toggleUserBanStatus,
  getUserActivityLog
} from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { isAdmin, isAdminOrResourceOwner } from '../middleware/role.middleware';

const router = express.Router();

// Protected routes for current user
router.get('/me', verifyToken, getCurrentUser);
router.put('/me', verifyToken, updateCurrentUser);


// Admin routes
router.get('/',verifyToken, getAllUsers);
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateUserById);
router.delete('/:id', verifyToken,deleteUserById);
router.patch('/:id/role', verifyToken,changeUserRole);
router.patch('/:id/ban', verifyToken,toggleUserBanStatus);

export default router;
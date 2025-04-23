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
router.get('/users',verifyToken, getAllUsers);
router.get('/users/:id', verifyToken, getUserById);
router.put('/users/:id', verifyToken, updateUserById);
router.delete('/users/:id', verifyToken,deleteUserById);
router.patch('/users/:id/role', verifyToken,changeUserRole);
router.patch('/users/:id/ban', verifyToken,toggleUserBanStatus);

export default router;
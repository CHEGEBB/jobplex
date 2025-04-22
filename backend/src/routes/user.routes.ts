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
import { isAdmin } from '../middleware/role.middleware';

const router = express.Router();

// Protected routes for current user
router.get('/me', verifyToken, getCurrentUser);
router.put('/me', verifyToken, updateCurrentUser);


// Admin routes
router.get('/users', isAdmin, getAllUsers);
router.get('/users/:id', isAdmin, getUserById);
router.put('/users/:id', isAdmin,updateUserById);
router.delete('/users/:id', isAdmin,deleteUserById);
router.patch('/users/:id/role', isAdmin,changeUserRole);
router.patch('/users/:id/ban', isAdmin,toggleUserBanStatus);
router.get('/users/:id/activity', isAdmin, getUserActivityLog);

export default router;
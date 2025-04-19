// src/routes/user.routes.ts
import express from 'express';
import { 
  getCurrentUser, 
  updateCurrentUser, 
  getUserById, 
  updateUserById, 
  deleteUserById 
} from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';

const router = express.Router();

// Protected routes for current user
router.get('/me', verifyToken, getCurrentUser);
router.put('/me', verifyToken, updateCurrentUser);

// Admin only routes
router.get('/:id', verifyToken, isAdmin, getUserById);
router.put('/:id', verifyToken, isAdmin, updateUserById);
router.delete('/:id', verifyToken, isAdmin, deleteUserById);

export default router;
import express from 'express';
import { 
  getEmployerProfile, 
  createEmployerProfile, 
  updateEmployerProfile, 
  deleteEmployerProfile 
} from '../controllers/employer-profile.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { isEmployer } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication and employer role
router.use(verifyToken, isEmployer);

// GET /api/employer/profile - Get the current employer's profile
router.get('/profile', getEmployerProfile);

// POST /api/employer/profile - Create a new employer profile
router.post('/profile', createEmployerProfile);

// PUT /api/employer/profile - Update an existing employer profile
router.put('/profile', updateEmployerProfile);

// DELETE /api/employer/profile - Delete an employer profile
router.delete('/profile', deleteEmployerProfile);

export default router;
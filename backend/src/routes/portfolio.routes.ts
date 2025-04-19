// src/routes/portfolio.routes.ts
import express from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { 
  // Skills endpoints
  getMySkills,
  createSkill,
  updateSkill,
  deleteSkill,
  
  // Projects endpoints
  getMyProjects,
  createProject,
  updateProject,
  deleteProject,
  
  // Certificates endpoints
  getMyCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate
} from '../controllers/portfolio.controller';

const router = express.Router();

// Skills routes
router.get('/skills', verifyToken, getMySkills);
router.post('/skills', verifyToken, createSkill);
router.put('/skills/:id', verifyToken, updateSkill);
router.delete('/skills/:id', verifyToken, deleteSkill);

// Projects routes
router.get('/projects', verifyToken, getMyProjects);
router.post('/projects', verifyToken, createProject);
router.put('/projects/:id', verifyToken, updateProject);
router.delete('/projects/:id', verifyToken, deleteProject);

// Certificates routes
router.get('/certificates', verifyToken, getMyCertificates);
router.post('/certificates', verifyToken, createCertificate);
router.put('/certificates/:id', verifyToken, updateCertificate);
router.delete('/certificates/:id', verifyToken, deleteCertificate);

export default router;
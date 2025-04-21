import express from 'express';
import {
  createCV,
  getUserCVs,
  getCVById,
  updateCV,
  setPrimaryCV,
  deleteCV,
  addTag,
  removeTag
} from '../controllers/cv.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

// CV CRUD operations
router.post('/', verifyToken, createCV);
router.get('/', verifyToken, getUserCVs);
router.get('/:cvId', verifyToken, getCVById);
router.put('/:cvId', verifyToken, updateCV);
router.patch('/:cvId/primary', verifyToken, setPrimaryCV);
router.delete('/:cvId', verifyToken, deleteCV);

// Tag operations
router.post('/:cvId/tags', verifyToken, addTag);
router.delete('/:cvId/tags/:tag', verifyToken, removeTag);

export default router;
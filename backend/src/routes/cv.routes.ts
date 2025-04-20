import express from 'express';
import {
  uploadCV,
  getUserCVs,
  setPrimaryCV,
  deleteCV,
  addTag,
  removeTag
} from '../controllers/cv.controller';
import { verifyToken } from '../middleware/auth.middleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// CV CRUD operations
router.post('/', verifyToken, upload.single('cv'), uploadCV);
router.get('/', verifyToken, getUserCVs);
router.patch('/:cvId/primary', verifyToken, setPrimaryCV);
router.delete('/:cvId', verifyToken, deleteCV);

// Tag operations
router.post('/:cvId/tags', verifyToken, addTag);
router.delete('/:cvId/tags/:tag', verifyToken, removeTag);

export default router;
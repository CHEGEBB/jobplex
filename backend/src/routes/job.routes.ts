import { Router } from 'express';
import jobController from '../controllers/job.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { UserRole } from '../interfaces/user.interface';

const router = Router();

/**
 * @route   POST /api/jobs
 * @desc    Create a new job posting
 * @access  Private/Employer
 */
router.post('/', authenticateToken, authorizeRoles(UserRole.EMPLOYER), jobController.createJob);

/**
 * @route   GET /api/jobs
 * @desc    Get all jobs (paginated)
 * @access  Public
 */
router.get('/', jobController.getAllJobs);

/**
 * @route   GET /api/jobs/:id
 * @desc    Get job by ID
 * @access  Public
 */
router.get('/:id', jobController.getJobById);

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update job posting
 * @access  Private/Employer
 */
router.put('/:id', authenticateToken, authorizeRoles(UserRole.EMPLOYER), jobController.updateJob);

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete job posting
 * @access  Private/Employer
 */
router.delete('/:id', authenticateToken, authorizeRoles(UserRole.EMPLOYER, UserRole.ADMIN), jobController.deleteJob);

export default router;
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_controller_1 = __importDefault(require("../controllers/job.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_interface_1 = require("../interfaces/user.interface");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/jobs
 * @desc    Create a new job posting
 * @access  Private/Employer
 */
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)(user_interface_1.UserRole.EMPLOYER), job_controller_1.default.createJob);
/**
 * @route   GET /api/jobs
 * @desc    Get all jobs (paginated)
 * @access  Public
 */
router.get('/', job_controller_1.default.getAllJobs);
/**
 * @route   GET /api/jobs/:id
 * @desc    Get job by ID
 * @access  Public
 */
router.get('/:id', job_controller_1.default.getJobById);
/**
 * @route   PUT /api/jobs/:id
 * @desc    Update job posting
 * @access  Private/Employer
 */
router.put('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)(user_interface_1.UserRole.EMPLOYER), job_controller_1.default.updateJob);
/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete job posting
 * @access  Private/Employer
 */
router.delete('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)(user_interface_1.UserRole.EMPLOYER, user_interface_1.UserRole.ADMIN), job_controller_1.default.deleteJob);
exports.default = router;

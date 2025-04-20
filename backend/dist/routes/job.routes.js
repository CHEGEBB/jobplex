"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/job.routes.ts
const express_1 = __importDefault(require("express"));
const job_controller_1 = require("../controllers/job.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = express_1.default.Router();
// Public routes
router.get('/', job_controller_1.getAllJobs);
router.get('/:id', job_controller_1.getJobById);
// Employer routes
router.get('/employer/me', auth_middleware_1.verifyToken, role_middleware_1.isEmployer, job_controller_1.getEmployerJobs);
router.post('/', auth_middleware_1.verifyToken, role_middleware_1.isEmployer, job_controller_1.createJob);
router.put('/:id', auth_middleware_1.verifyToken, role_middleware_1.isEmployer, job_controller_1.updateJob);
router.patch('/:id/status', auth_middleware_1.verifyToken, role_middleware_1.isEmployer, job_controller_1.updateJobStatus);
router.delete('/:id', auth_middleware_1.verifyToken, role_middleware_1.isEmployer, job_controller_1.deleteJob);
// Job seeker routes
router.post('/:id/apply', auth_middleware_1.verifyToken, role_middleware_1.isJobSeeker, job_controller_1.applyForJob);
router.get('/matches/me', auth_middleware_1.verifyToken, role_middleware_1.isJobSeeker, job_controller_1.getJobMatches);
exports.default = router;

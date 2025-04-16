"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const job_service_1 = __importDefault(require("../services/job.service"));
const user_interface_1 = require("../interfaces/user.interface");
class JobController {
    async createJob(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }
            if (req.user?.role !== user_interface_1.UserRole.EMPLOYER) {
                return res.status(403).json({
                    success: false,
                    message: 'Only employers can create jobs'
                });
            }
            const jobData = {
                title: req.body.title,
                description: req.body.description,
                company: req.body.company,
                location: req.body.location,
                salary: req.body.salary,
                employerId: userId,
                employmentType: req.body.employmentType,
                experienceLevel: req.body.experienceLevel,
                status: req.body.status || 'open'
            };
            const skills = req.body.skills || [];
            const job = await job_service_1.default.createJob(jobData, skills);
            res.status(201).json({ success: true, data: job });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error creating job'
            });
        }
    }
    async getJobById(req, res) {
        try {
            const jobId = parseInt(req.params.id);
            const job = await job_service_1.default.getJobById(jobId);
            res.status(200).json({ success: true, data: job });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error fetching job'
            });
        }
    }
    async getAllJobs(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status || 'open';
            const search = req.query.search;
            const location = req.query.location;
            const result = await job_service_1.default.getAllJobs(page, limit, status, search, location);
            res.status(200).json({
                success: true,
                data: result.jobs,
                meta: {
                    total: result.total,
                    page,
                    limit,
                    pages: Math.ceil(result.total / limit)
                }
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error fetching jobs'
            });
        }
    }
    async updateJob(req, res) {
        try {
            const jobId = parseInt(req.params.id);
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }
            const jobData = {};
            if (req.body.title !== undefined)
                jobData.title = req.body.title;
            if (req.body.description !== undefined)
                jobData.description = req.body.description;
            if (req.body.company !== undefined)
                jobData.company = req.body.company;
            if (req.body.location !== undefined)
                jobData.location = req.body.location;
            if (req.body.salary !== undefined)
                jobData.salary = req.body.salary;
            if (req.body.employmentType !== undefined)
                jobData.employmentType = req.body.employmentType;
            if (req.body.experienceLevel !== undefined)
                jobData.experienceLevel = req.body.experienceLevel;
            if (req.body.status !== undefined)
                jobData.status = req.body.status;
            const skills = req.body.skills !== undefined ? req.body.skills : undefined;
            const updatedJob = await job_service_1.default.updateJob(jobId, jobData, skills);
            res.status(200).json({ success: true, data: updatedJob });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error updating job'
            });
        }
    }
    async deleteJob(req, res) {
        try {
            const jobId = parseInt(req.params.id);
            await job_service_1.default.deleteJob(jobId);
            res.status(200).json({
                success: true,
                message: 'Job deleted successfully'
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error deleting job'
            });
        }
    }
}
exports.JobController = JobController;
exports.default = new JobController();

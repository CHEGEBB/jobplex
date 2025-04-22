"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/profile.routes.ts
const express_1 = __importDefault(require("express"));
const profile_controller_1 = require("../controllers/profile.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = express_1.default.Router();
// Apply job seeker role check to all profile routes
router.use(auth_middleware_1.verifyToken, role_middleware_1.isJobSeeker);
// Profile routes
router.get('/', profile_controller_1.getProfile);
router.put('/', profile_controller_1.updateProfile);
router.post('/photo', profile_controller_1.uploadProfilePhoto);
// Skill routes
router.post('/skills', profile_controller_1.addSkill);
router.delete('/skills/:id', profile_controller_1.removeSkill);
// Experience routes
router.post('/experience', profile_controller_1.addExperience);
router.put('/experience/:id', profile_controller_1.updateExperience);
router.delete('/experience/:id', profile_controller_1.deleteExperience);
// Education routes
router.post('/education', profile_controller_1.addEducation);
router.put('/education/:id', profile_controller_1.updateEducation);
router.delete('/education/:id', profile_controller_1.deleteEducation);
// Document routes
router.post('/documents', profile_controller_1.uploadDocument);
router.delete('/documents/:id', profile_controller_1.deleteDocument);
exports.default = router;

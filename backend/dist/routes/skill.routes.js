"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/skill.routes.ts
const express_1 = __importDefault(require("express"));
const skill_controller_1 = require("../controllers/skill.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = express_1.default.Router();
// Public routes
router.get('/', skill_controller_1.getAllSkills);
router.get('/:id', skill_controller_1.getSkillById);
// Protected routes for job seekers
router.get('/my-skills', auth_middleware_1.verifyToken, role_middleware_1.isJobSeeker, skill_controller_1.getUserSkills);
router.post('/', auth_middleware_1.verifyToken, role_middleware_1.isJobSeeker, skill_controller_1.createSkill);
router.put('/:id', auth_middleware_1.verifyToken, role_middleware_1.isJobSeeker, skill_controller_1.updateSkill);
router.delete('/:id', auth_middleware_1.verifyToken, role_middleware_1.isJobSeeker, skill_controller_1.deleteSkill);
exports.default = router;

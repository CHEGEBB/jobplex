"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const skill_controller_1 = __importDefault(require("../controllers/skill.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_interface_1 = require("../interfaces/user.interface");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/skills
 * @desc    Create a new skill
 * @access  Private/Admin
 */
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)(user_interface_1.UserRole.ADMIN), skill_controller_1.default.createSkill);
/**
 * @route   GET /api/skills
 * @desc    Get all skills
 * @access  Public
 */
router.get('/', skill_controller_1.default.getAllSkills);
/**
 * @route   GET /api/skills/:id
 * @desc    Get skill by ID
 * @access  Public
 */
router.get('/:id', skill_controller_1.default.getSkillById);
/**
 * @route   POST /api/skills/user
 * @desc    Add a skill to current user
 * @access  Private
 */
router.post('/user', auth_middleware_1.authenticateToken, skill_controller_1.default.addUserSkill);
/**
 * @route   GET /api/skills/user/:userId
 * @desc    Get skills for a specific user
 * @access  Public
 */
router.get('/user/:userId', skill_controller_1.default.getUserSkills);
/**
 * @route   DELETE /api/skills/user/:skillId
 * @desc    Remove a skill from current user
 * @access  Private
 */
router.delete('/user/:skillId', auth_middleware_1.authenticateToken, skill_controller_1.default.removeUserSkill);
exports.default = router;

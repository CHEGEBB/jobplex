"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillController = void 0;
const skill_service_1 = __importDefault(require("../services/skill.service"));
const user_interface_1 = require("../interfaces/user.interface");
class SkillController {
    async createSkill(req, res) {
        try {
            // Only admins can create new skills
            if (req.user?.role !== user_interface_1.UserRole.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Only admins can create new skills'
                });
            }
            const skillData = {
                name: req.body.name,
                category: req.body.category
            };
            const skill = await skill_service_1.default.createSkill(skillData);
            res.status(201).json({ success: true, data: skill });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error creating skill'
            });
        }
    }
    async getAllSkills(req, res) {
        try {
            const skills = await skill_service_1.default.getAllSkills();
            res.status(200).json({ success: true, data: skills });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error fetching skills'
            });
        }
    }
    async getSkillById(req, res) {
        try {
            const skillId = parseInt(req.params.id);
            const skill = await skill_service_1.default.getSkillById(skillId);
            res.status(200).json({ success: true, data: skill });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error fetching skill'
            });
        }
    }
    async addUserSkill(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }
            const userSkillData = {
                userId: userId,
                skillId: req.body.skillId,
                proficiencyLevel: req.body.proficiencyLevel,
                yearsOfExperience: req.body.yearsOfExperience
            };
            const userSkill = await skill_service_1.default.addUserSkill(userSkillData);
            res.status(201).json({ success: true, data: userSkill });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error adding user skill'
            });
        }
    }
    async getUserSkills(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const userSkills = await skill_service_1.default.getUserSkills(userId);
            res.status(200).json({ success: true, data: userSkills });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error fetching user skills'
            });
        }
    }
    async removeUserSkill(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }
            const skillId = parseInt(req.params.skillId);
            await skill_service_1.default.removeUserSkill(userId, skillId);
            res.status(200).json({
                success: true,
                message: 'User skill removed successfully'
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error removing user skill'
            });
        }
    }
}
exports.SkillController = SkillController;
exports.default = new SkillController();

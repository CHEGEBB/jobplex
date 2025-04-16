"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = __importDefault(require("../services/user.service"));
class UserController {
    async getCurrentUser(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }
            const user = await user_service_1.default.getUserById(userId);
            res.status(200).json({ success: true, data: user });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error fetching user'
            });
        }
    }
    async getUserById(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const user = await user_service_1.default.getUserById(userId);
            res.status(200).json({ success: true, data: user });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error fetching user'
            });
        }
    }
    async updateUser(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }
            const userData = req.body;
            const updatedUser = await user_service_1.default.updateUser(userId, userData);
            res.status(200).json({ success: true, data: updatedUser });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error updating user'
            });
        }
    }
    async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await user_service_1.default.getAllUsers(page, limit);
            res.status(200).json({
                success: true,
                data: result.users,
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
                message: error.message || 'Error fetching users'
            });
        }
    }
    async deleteUser(req, res) {
        try {
            const userId = parseInt(req.params.id);
            await user_service_1.default.deleteUser(userId);
            res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error deleting user'
            });
        }
    }
}
exports.UserController = UserController;
exports.default = new UserController();

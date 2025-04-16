"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_interface_1 = require("../interfaces/user.interface");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth_middleware_1.authenticateToken, user_controller_1.default.getCurrentUser);
/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', auth_middleware_1.authenticateToken, user_controller_1.default.updateUser);
/**
 * @route   GET /api/users
 * @desc    Get all users (paginated)
 * @access  Private/Admin
 */
router.get('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)(user_interface_1.UserRole.ADMIN), user_controller_1.default.getAllUsers);
/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private/Admin
 */
router.get('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)(user_interface_1.UserRole.ADMIN), user_controller_1.default.getUserById);
/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)(user_interface_1.UserRole.ADMIN), user_controller_1.default.deleteUser);
exports.default = router;

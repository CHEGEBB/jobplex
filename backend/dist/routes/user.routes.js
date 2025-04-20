"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/user.routes.ts
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = express_1.default.Router();
// Protected routes for current user
router.get('/me', auth_middleware_1.verifyToken, user_controller_1.getCurrentUser);
router.put('/me', auth_middleware_1.verifyToken, user_controller_1.updateCurrentUser);
// Admin only routes
router.get('/:id', auth_middleware_1.verifyToken, role_middleware_1.isAdmin, user_controller_1.getUserById);
router.put('/:id', auth_middleware_1.verifyToken, role_middleware_1.isAdmin, user_controller_1.updateUserById);
router.delete('/:id', auth_middleware_1.verifyToken, role_middleware_1.isAdmin, user_controller_1.deleteUserById);
exports.default = router;

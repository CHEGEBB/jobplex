"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = __importDefault(require("../services/auth.service"));
class AuthController {
    async register(req, res) {
        try {
            const userData = {
                email: req.body.email,
                password: req.body.password,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                role: req.body.role,
                company: req.body.company,
                position: req.body.position,
                location: req.body.location,
                bio: req.body.bio,
                phone: req.body.phone
            };
            const user = await auth_service_1.default.register(userData);
            res.status(201).json({ success: true, data: user });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error registering user'
            });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }
            const result = await auth_service_1.default.login(email, password);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error during login'
            });
        }
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController();

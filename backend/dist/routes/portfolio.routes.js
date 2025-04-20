"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/portfolio.routes.ts
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const portfolio_controller_1 = require("../controllers/portfolio.controller");
const router = express_1.default.Router();
// Skills routes
router.get('/skills', auth_middleware_1.verifyToken, portfolio_controller_1.getMySkills);
router.post('/skills', auth_middleware_1.verifyToken, portfolio_controller_1.createSkill);
router.put('/skills/:id', auth_middleware_1.verifyToken, portfolio_controller_1.updateSkill);
router.delete('/skills/:id', auth_middleware_1.verifyToken, portfolio_controller_1.deleteSkill);
// Projects routes
router.get('/projects', auth_middleware_1.verifyToken, portfolio_controller_1.getMyProjects);
router.post('/projects', auth_middleware_1.verifyToken, portfolio_controller_1.createProject);
router.put('/projects/:id', auth_middleware_1.verifyToken, portfolio_controller_1.updateProject);
router.delete('/projects/:id', auth_middleware_1.verifyToken, portfolio_controller_1.deleteProject);
// Certificates routes
router.get('/certificates', auth_middleware_1.verifyToken, portfolio_controller_1.getMyCertificates);
router.post('/certificates', auth_middleware_1.verifyToken, portfolio_controller_1.createCertificate);
router.put('/certificates/:id', auth_middleware_1.verifyToken, portfolio_controller_1.updateCertificate);
router.delete('/certificates/:id', auth_middleware_1.verifyToken, portfolio_controller_1.deleteCertificate);
exports.default = router;

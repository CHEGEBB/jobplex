"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cv_controller_1 = require("../controllers/cv.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = express_1.default.Router();
// CV CRUD operations
router.post('/', auth_middleware_1.verifyToken, upload.single('cv'), cv_controller_1.uploadCV);
router.get('/', auth_middleware_1.verifyToken, cv_controller_1.getUserCVs);
router.patch('/:cvId/primary', auth_middleware_1.verifyToken, cv_controller_1.setPrimaryCV);
router.delete('/:cvId', auth_middleware_1.verifyToken, cv_controller_1.deleteCV);
// Tag operations
router.post('/:cvId/tags', auth_middleware_1.verifyToken, cv_controller_1.addTag);
router.delete('/:cvId/tags/:tag', auth_middleware_1.verifyToken, cv_controller_1.removeTag);
exports.default = router;

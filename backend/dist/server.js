"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_config_1 = require("./config/db.config");
const error_middleware_1 = require("./middleware/error.middleware");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const skill_routes_1 = __importDefault(require("./routes/skill.routes"));
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// Test database connection
(0, db_config_1.testConnection)();
// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to JobPlex API!' });
});
// API routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/jobs', job_routes_1.default);
app.use('/api/skills', skill_routes_1.default);
// Error handling
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
exports.default = app;

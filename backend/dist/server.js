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
const error_middleware_1 = require("./middleware/error.middleware");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const skill_routes_1 = __importDefault(require("./routes/skill.routes"));
const portfolio_routes_1 = __importDefault(require("./routes/portfolio.routes"));
const cv_routes_1 = __importDefault(require("./routes/cv.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const db_config_1 = __importDefault(require("./config/db.config"));
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 80;
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Add graceful error handling for database connection issues
db_config_1.default.on('error', (err) => {
    console.error('Unexpected database error:', err);
    // Don't crash the server on connection errors after startup
});
// Test database connection on startup, but don't block server startup
const testDatabaseConnection = async () => {
    try {
        const client = await db_config_1.default.connect();
        const result = await client.query('SELECT NOW()');
        console.log('Database connected successfully:', result.rows[0]);
        client.release();
        return true;
    }
    catch (err) {
        console.error('Database connection test failed:', err);
        console.error('The API will start anyway, but database operations will fail until connection is restored');
        return false;
    }
};
// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to JobPlex API!' });
});
// API routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/jobs', job_routes_1.default);
app.use('/api/skills', skill_routes_1.default);
app.use('/api/portfolio', portfolio_routes_1.default);
app.use('/api/cvs', cv_routes_1.default);
app.use('/api/profile', profile_routes_1.default);
app.get('/api/health', async (req, res) => {
    try {
        // Quick db connection check
        const client = await db_config_1.default.connect();
        await client.query('SELECT 1');
        client.release();
        res.status(200).json({
            status: 'ok',
            time: new Date().toISOString(),
            database: 'connected',
            environment: process.env.NODE_ENV
        });
    }
    catch (err) {
        res.status(200).json({
            status: 'degraded',
            time: new Date().toISOString(),
            database: 'disconnected',
            environment: process.env.NODE_ENV,
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
});
// Error handling
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
// Start server without waiting for database
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Test database connection after server starts
    testDatabaseConnection().then(connected => {
        if (connected) {
            console.log('Server is fully operational with database connection');
        }
        else {
            console.log('Server started but database connection failed - check your RDS configuration');
        }
    });
});
exports.default = app;

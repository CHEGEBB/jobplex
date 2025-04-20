"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_config_1 = __importDefault(require("../config/db.config"));
// Load environment variables to ensure they're available
dotenv_1.default.config();
// Get JWT configuration with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here';
// Define the JWT expiration value properly typed for SignOptions
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';
// Register new user
const register = async (req, res) => {
    const { email, password, role, firstName, lastName } = req.body;
    // Validate input
    if (!email || !password || !role || !['jobseeker', 'employer'].includes(role)) {
        res.status(400).json({ message: 'Invalid input data' });
        return;
    }
    try {
        // Check if user already exists
        const userCheck = await db_config_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            res.status(409).json({ message: 'User already exists with this email' });
            return;
        }
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        // Create user with transaction to ensure atomicity
        const client = await db_config_1.default.connect();
        try {
            await client.query('BEGIN');
            // Insert user
            const userResult = await client.query('INSERT INTO users (email, password, role, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, first_name, last_name', [email, hashedPassword, role, firstName, lastName]);
            const user = userResult.rows[0];
            // Create respective profile based on role
            if (role === 'jobseeker') {
                await client.query('INSERT INTO jobseeker_profiles (user_id) VALUES ($1)', [user.id]);
            }
            else if (role === 'employer') {
                await client.query('INSERT INTO employer_profiles (user_id, company_name) VALUES ($1, $2)', [user.id, '']);
            }
            await client.query('COMMIT');
            // Generate JWT token with explicit type handling
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION } // Force type casting to resolve the type issue
            );
            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.first_name,
                    lastName: user.last_name
                }
            });
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};
exports.register = register;
// Login user
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    try {
        // Find user by email
        const result = await db_config_1.default.query('SELECT id, email, password, role, first_name, last_name FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const user = result.rows[0];
        // Compare passwords
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Generate JWT token with type casting to resolve the issue
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION } // Force type casting
        );
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
exports.login = login;
// Forgot password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }
    try {
        // Check if user exists
        const result = await db_config_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            // For security reasons, don't reveal that the email doesn't exist
            res.status(200).json({ message: 'If your email exists in our system, a password reset link will be sent' });
            return;
        }
        const user = result.rows[0];
        // Generate reset token with proper typing
        const resetToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, purpose: 'reset_password' }, JWT_SECRET, { expiresIn: '1h' } // Type casting for consistency
        );
        // Store token in database (in a real app, you would have a password_resets table)
        // For now, just return the token in the response (in a real app, send via email)
        res.status(200).json({
            message: 'Password reset link sent successfully',
            // In a real app, don't return this token in the response
            resetToken
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error processing password reset request' });
    }
};
exports.forgotPassword = forgotPassword;
// Reset password
const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        res.status(400).json({ message: 'Token and password are required' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (decoded.purpose !== 'reset_password') {
            res.status(400).json({ message: 'Invalid token' });
            return;
        }
        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        // Update user password
        await db_config_1.default.query('UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedPassword, decoded.id]);
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }
        res.status(500).json({ message: 'Server error resetting password' });
    }
};
exports.resetPassword = resetPassword;

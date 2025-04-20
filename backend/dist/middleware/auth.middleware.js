"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_config_1 = __importDefault(require("../config/db.config"));
const verifyToken = async (req, res, next) => {
    try {
        // Get the token from authorization header
        const authHeader = req.headers.authorization;
        console.log('Auth header received:', authHeader);
        let token;
        if (authHeader) {
            // Format: "Bearer <token>"
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
                token = parts[1];
                console.log('Bearer token found and extracted');
            }
            else if (authHeader.startsWith('ey')) {
                // If it starts with 'ey' it's likely a raw JWT token
                token = authHeader;
                console.log('Raw JWT token detected and extracted');
            }
            else {
                console.log('Auth header format not recognized');
                return res.status(401).json({ message: 'Invalid authorization header format' });
            }
        }
        if (!token) {
            console.log('No token found in request');
            return res.status(401).json({ message: 'No token provided' });
        }
        // Check token format
        if (!token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/)) {
            console.log('Token format is invalid');
            return res.status(401).json({ message: 'Invalid token format' });
        }
        // Verify token
        const secret = process.env.JWT_SECRET || 'your_secret_key_here';
        console.log('Using JWT secret:', secret ? '[SECRET MASKED]' : 'Default fallback secret');
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, secret);
            console.log('Token verified successfully');
            console.log('Decoded token data:', {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                issuedAt: new Date(decoded.iat * 1000).toISOString(),
                expiration: new Date(decoded.exp * 1000).toISOString()
            });
            // Check token expiration
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp < currentTime) {
                console.log('Token has expired');
                return res.status(401).json({ message: 'Token expired' });
            }
        }
        catch (verifyError) {
            console.error('Token verification failed:', verifyError);
            if (verifyError instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            if (verifyError instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(401).json({ message: 'Token verification failed' });
        }
        // Check if user exists in the database
        console.log('Checking if user exists in database with ID:', decoded.id);
        const userResult = await db_config_1.default.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.id]);
        if (userResult.rows.length === 0) {
            console.log('User not found in database');
            return res.status(401).json({ message: 'User not found' });
        }
        console.log('User found in database:', userResult.rows[0]);
        // Verify that the role in the token matches the role in the database
        if (decoded.role !== userResult.rows[0].role) {
            console.log('Role mismatch between token and database');
            console.log('Token role:', decoded.role);
            console.log('Database role:', userResult.rows[0].role);
            return res.status(401).json({ message: 'Invalid user role' });
        }
        // Attach user info to request
        req.user = decoded;
        console.log('User authentication successful, proceeding to next middleware');
        next();
    }
    catch (error) {
        console.error('Auth middleware unexpected error:', error);
        return res.status(500).json({ message: 'Authentication failed due to server error' });
    }
};
exports.verifyToken = verifyToken;

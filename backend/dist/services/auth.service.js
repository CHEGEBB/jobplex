"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_config_1 = require("../config/db.config");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
class AuthService {
    async register(userData) {
        const { email, password, firstName, lastName, role } = userData;
        // Check if user with the same email already exists
        const existingUser = await db_config_1.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if ((existingUser.rowCount ?? 0) > 0) {
            throw { statusCode: 400, message: 'User with this email already exists' };
        }
        // Hash the password
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        // Insert new user
        const result = await db_config_1.pool.query(`INSERT INTO users (email, password, first_name, last_name, role, 
        company, position, location, bio, phone, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) 
       RETURNING id, email, first_name, last_name, role, company, position, location, bio, phone, created_at, updated_at`, [
            email,
            hashedPassword,
            firstName,
            lastName,
            role,
            userData.company || null,
            userData.position || null,
            userData.location || null,
            userData.bio || null,
            userData.phone || null,
        ]);
        const user = result.rows[0];
        return {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            company: user.company,
            position: user.position,
            location: user.location,
            bio: user.bio,
            phone: user.phone,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        };
    }
    async login(email, password) {
        // Find user by email
        const result = await db_config_1.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rowCount === 0) {
            throw { statusCode: 401, message: 'Invalid credentials' };
        }
        const user = result.rows[0];
        // Compare password
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw { statusCode: 401, message: 'Invalid credentials' };
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: typeof JWT_EXPIRES_IN === 'string' ? parseInt(JWT_EXPIRES_IN, 10) : JWT_EXPIRES_IN });
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                company: user.company,
                position: user.position,
                location: user.location,
                bio: user.bio,
                phone: user.phone,
                createdAt: user.created_at,
                updatedAt: user.updated_at
            },
            token
        };
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();

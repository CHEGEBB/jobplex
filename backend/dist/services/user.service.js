"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_config_1 = require("../config/db.config");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserService {
    async getUserById(id) {
        const result = await db_config_1.pool.query(`SELECT id, email, first_name, last_name, role, company, position, 
              location, bio, phone, created_at, updated_at 
       FROM users WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            throw { statusCode: 404, message: 'User not found' };
        }
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
    async updateUser(id, userData) {
        // Create an array to hold our query parts
        const updates = [];
        const values = [];
        let paramCount = 1;
        // Add all user data fields that are present
        if (userData.firstName !== undefined) {
            updates.push(`first_name = $${paramCount++}`);
            values.push(userData.firstName);
        }
        if (userData.lastName !== undefined) {
            updates.push(`last_name = $${paramCount++}`);
            values.push(userData.lastName);
        }
        if (userData.company !== undefined) {
            updates.push(`company = $${paramCount++}`);
            values.push(userData.company);
        }
        if (userData.position !== undefined) {
            updates.push(`position = $${paramCount++}`);
            values.push(userData.position);
        }
        if (userData.location !== undefined) {
            updates.push(`location = $${paramCount++}`);
            values.push(userData.location);
        }
        if (userData.bio !== undefined) {
            updates.push(`bio = $${paramCount++}`);
            values.push(userData.bio);
        }
        if (userData.phone !== undefined) {
            updates.push(`phone = $${paramCount++}`);
            values.push(userData.phone);
        }
        if (userData.password) {
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(userData.password, salt);
            updates.push(`password = $${paramCount++}`);
            values.push(hashedPassword);
        }
        // Always update the updated_at timestamp
        updates.push(`updated_at = NOW()`);
        // Add the ID as the last parameter
        values.push(id);
        const result = await db_config_1.pool.query(`UPDATE users SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, email, first_name, last_name, role, company, 
                 position, location, bio, phone, created_at, updated_at`, values);
        if (result.rowCount === 0) {
            throw { statusCode: 404, message: 'User not found' };
        }
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
    async getAllUsers(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        // Get total count
        const countResult = await db_config_1.pool.query('SELECT COUNT(*) FROM users');
        const total = parseInt(countResult.rows[0].count);
        // Get paginated users
        const result = await db_config_1.pool.query(`SELECT id, email, first_name, last_name, role, company, position, 
              location, bio, phone, created_at, updated_at 
       FROM users 
       ORDER BY id 
       LIMIT $1 OFFSET $2`, [limit, offset]);
        const users = result.rows.map(user => ({
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
        }));
        return { users, total };
    }
    async deleteUser(id) {
        const result = await db_config_1.pool.query('DELETE FROM users WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            throw { statusCode: 404, message: 'User not found' };
        }
    }
}
exports.default = new UserService();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    host: process.env.DB_HOST || '127.0.0.1', // Use IPv4 explicitly instead of 'localhost'
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'jobplex',
});
exports.pool = pool;
// Test connection function
const testConnection = async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Database connected successfully:', res.rows[0]);
    }
    catch (err) {
        console.error('Database connection error:', err);
    }
};
exports.testConnection = testConnection;

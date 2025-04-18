"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Different connection configurations for AWS RDS
const pool = new pg_1.Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false,
    // Add connection timeout settings
    connectionTimeoutMillis: 10000, // 10 seconds
    idleTimeoutMillis: 30000 // 30 seconds
});
exports.pool = pool;
// Log connection details (remove passwords in production)
console.log(`Attempting to connect to database:
  Host: ${process.env.DB_HOST}
  Port: ${process.env.DB_PORT}
  User: ${process.env.DB_USER}
  Database: ${process.env.DB_NAME}
  SSL: ${process.env.DB_SSL === 'true' ? 'Enabled (with rejectUnauthorized: false)' : 'Disabled'}
`);
// Test connection function with better error handling
const testConnection = async () => {
    let connected = false;
    let attempts = 0;
    const maxAttempts = 5;
    while (!connected && attempts < maxAttempts) {
        try {
            const client = await pool.connect();
            const res = await client.query('SELECT NOW()');
            console.log('Database connected successfully:', res.rows[0]);
            client.release();
            connected = true;
        }
        catch (err) {
            attempts++;
            console.error(`Database connection attempt ${attempts} failed:`, err);
            // Better error diagnostic information
            if (err.code) {
                console.error(`Error code: ${err.code}`);
                switch (err.code) {
                    case '28000':
                        console.error('Authentication error: Check your username and password, and ensure your IP is allowed in RDS security groups');
                        break;
                    case 'ETIMEDOUT':
                    case 'ECONNREFUSED':
                        console.error('Connection timeout: Check if RDS is publicly accessible and security groups allow traffic');
                        break;
                    case 'ENOTFOUND':
                        console.error('Host not found: Check if your RDS endpoint is correct');
                        break;
                }
            }
            if (attempts < maxAttempts) {
                const waitTime = 5000; // 5 seconds
                console.log(`Waiting ${waitTime / 1000} seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    if (!connected) {
        console.error(`Failed to connect to database after ${maxAttempts} attempts`);
        console.error('Please check RDS settings, security groups, and network configuration');
    }
};
exports.testConnection = testConnection;

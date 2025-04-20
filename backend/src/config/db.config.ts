import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Enhanced connection configuration for AWS RDS
const pool = new Pool({
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
  idleTimeoutMillis: 30000, // 30 seconds
  max: 20, // Maximum number of clients in the pool
  statement_timeout: 10000, // Statement timeout in milliseconds
  query_timeout: 15000, // Query timeout
});

// Log connection details (remove passwords in production)
console.log(`Database configuration:
  Host: ${process.env.DB_HOST}
  Port: ${process.env.DB_PORT}
  User: ${process.env.DB_USER}
  Database: ${process.env.DB_NAME}
  SSL: ${process.env.DB_SSL === 'true' ? 'Enabled (with rejectUnauthorized: false)' : 'Disabled'}
  Max Pool Size: 20
  Connection Timeout: 10s
  Query Timeout: 15s
`);

// Add robust error handling
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

// Add connection monitoring
pool.on('connect', (client) => {
  console.log('New client connected to the database');
});

export default pool;
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'jobplex',
});

// Test connection function with basic retries
const testConnection = async (): Promise<void> => {
  let connected = false;
  let attempts = 0;
  const maxAttempts = 5;
  
  while (!connected && attempts < maxAttempts) {
    try {
      const res = await pool.query('SELECT NOW()');
      console.log('Database connected successfully:', res.rows[0]);
      connected = true;
    } catch (err) {
      attempts++;
      console.error(`Database connection attempt ${attempts} failed:`, err);
      
      if (attempts < maxAttempts) {
        console.log(`Waiting 5 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  if (!connected) {
    console.error(`Failed to connect to database after ${maxAttempts} attempts`);
  }
};

export { pool, testConnection };
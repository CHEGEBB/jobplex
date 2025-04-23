import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import jobRoutes from './routes/job.routes';
import skillRoutes from './routes/skill.routes';
import portfolioRoutes from './routes/portfolio.routes';
import cvRoutes from './routes/cv.routes'
import profileRoutes from './routes/profile.routes';
import employerProfileRoutes from './routes/employer-profile.routes';
import aiRoutes from './routes/ai.routes';
import pool from './config/db.config';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 80;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add graceful error handling for database connection issues
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  // Don't crash the server on connection errors after startup
});

// Test database connection on startup, but don't block server startup
const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connected successfully:', result.rows[0]);
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection test failed:', err);
    console.error('The API will start anyway, but database operations will fail until connection is restored');
    return false;
  }
};

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to JobPlex API!' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/cvs', cvRoutes)
app.use('/api/profile', profileRoutes);
app.use('/api/employer', employerProfileRoutes);
app.use('/api/ai', aiRoutes);


app.get('/api/health', async (req, res) => {
  try {
    // Quick db connection check
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    res.status(200).json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV
    });
  } catch (err) {
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
app.use(notFoundHandler);
app.use(errorHandler);

// Start server without waiting for database
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Test database connection after server starts
  testDatabaseConnection().then(connected => {
    if (connected) {
      console.log('Server is fully operational with database connection');
    } else {
      console.log('Server started but database connection failed - check your RDS configuration');
    }
  });
});

export default app;
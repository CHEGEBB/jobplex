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

// Import the setupSchema function
import { setupSchema } from './controllers/portfolio.controller';
import pool from './config/db.config'; // Import the pool for testing connection

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT= process.env.PORT || 80;

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

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server and initialize database
const startServer = async () => {
  try {
    // First test the database connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connected successfully:', result.rows[0]);
    client.release();
    
    // Then setup schema
    await setupSchema();
    
    // Finally start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1); // Exit if we can't connect to the database
  }
};

startServer();

export default app;
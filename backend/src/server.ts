import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import jobRoutes from './routes/job.routes';
import skillRoutes from './routes/skill.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

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

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
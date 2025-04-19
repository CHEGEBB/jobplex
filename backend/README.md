# JobPlex Backend API

A Node.js/Express backend for JobPlex - an AI-powered job matching platform built with Angular 19 that connects job seekers with employers based on skills rather than job titles.

## Project Overview

This backend API supports the JobPlex platform by providing authentication, user management, job posting/matching, and skills management functionality. It's designed to work with a PostgreSQL database hosted on AWS RDS.

## Technology Stack

- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL (AWS RDS)
- **Authentication**: JWT with role-based access control
- **Containerization**: Docker
- **Deployment**: AWS EC2 (http://18.208.134.30/api)

## Project Structure

```
jobplex-backend/
├── src/
│   ├── config/                  # Configuration files
│   │   └── db.config.ts         # Database configuration
│   │
│   ├── controllers/             # Request handlers
│   │   ├── auth.controller.ts   # Authentication logic
│   │   ├── user.controller.ts   # User management
│   │   ├── job.controller.ts    # Job management
│   │   └── skill.controller.ts  # Skills management
│   │
│   ├── middleware/              # Middleware functions
│   │   ├── auth.middleware.ts   # JWT authentication
│   │   ├── role.middleware.ts   # Role-based access control
│   │   └── error.middleware.ts  # Error handling
│   │
│   ├── routes/                  # API routes
│   │   ├── auth.routes.ts       # Auth endpoints
│   │   ├── user.routes.ts       # User endpoints
│   │   ├── job.routes.ts        # Job endpoints
│   │   └── skill.routes.ts      # Skills endpoints
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── auth.types.ts        # Auth related types
│   │   ├── user.types.ts        # User related types
│   │   ├── job.types.ts         # Job related types
│   │   └── skill.types.ts       # Skills related types
│   │
│   └── server.ts                # Main server file
│
├── Dockerfile                   # Docker configuration
├── .env                         # Environment variables
├── .gitignore                   # Git ignore file
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project documentation
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user (job seeker or employer)
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Management

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user by ID (admin only)
- `DELETE /api/users/:id` - Delete user by ID (admin only)

### Job Management

- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job (employer only)
- `PUT /api/jobs/:id` - Update job (employer who created it only)
- `DELETE /api/jobs/:id` - Delete job (employer who created it only)
- `POST /api/jobs/:id/apply` - Apply for a job (job seeker only)
- `GET /api/jobs/matches` - Get job matches based on skills (job seeker only)

### Skills Management

- `GET /api/skills` - Get all skills
- `GET /api/skills/:id` - Get skill by ID
- `POST /api/skills` - Create new skill (job seeker only)
- `PUT /api/skills/:id` - Update skill (job seeker who created it only)
- `DELETE /api/skills/:id` - Delete skill (job seeker who created it only)

## Implementation Details

### Controller Implementation

All controllers follow this pattern:

```typescript
// Example: skill.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db.config';

// Get all skills
export const getAllSkills = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM skills');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get skill by ID
export const getSkillById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM skills WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching skill:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

### Middleware Implementation

```typescript
// Example: auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

### Route Implementation

```typescript
// Example: skill.routes.ts
import express from 'express';
import { getAllSkills, getSkillById, createSkill, updateSkill, deleteSkill } from '../controllers/skill.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { isJobSeeker } from '../middleware/role.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllSkills);
router.get('/:id', getSkillById);

// Protected routes
router.post('/', verifyToken, isJobSeeker, createSkill);
router.put('/:id', verifyToken, isJobSeeker, updateSkill);
router.delete('/:id', verifyToken, isJobSeeker, deleteSkill);

export default router;
```

## Role-Based Access Control

This backend implements role-based access control with three roles:

1. **Job Seeker**: Can create/update/delete their own skills, apply to jobs
2. **Employer**: Can create/update/delete their own job posts, view candidates
3. **Admin**: Has full access to all features and user management

The middleware `role.middleware.ts` handles these permissions:

```typescript
// role.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const isJobSeeker = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'job_seeker') {
    return next();
  }
  return res.status(403).json({ message: 'Requires job seeker role' });
};

export const isEmployer = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'employer') {
    return next();
  }
  return res.status(403).json({ message: 'Requires employer role' });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Requires admin role' });
};
```

## Database Schema

The PostgreSQL database on AWS RDS uses these tables:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('job_seeker', 'employer', 'admin')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job seeker profiles
CREATE TABLE job_seeker_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100),
  bio TEXT,
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employer profiles
CREATE TABLE employer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(100) NOT NULL,
  company_size VARCHAR(50),
  industry VARCHAR(100),
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  proficiency VARCHAR(50) CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(100),
  salary_range VARCHAR(100),
  job_type VARCHAR(50) CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job skills (many-to-many)
CREATE TABLE job_skills (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  importance VARCHAR(50) CHECK (importance IN ('required', 'preferred', 'nice-to-have')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job applications
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) CHECK (status IN ('pending', 'reviewing', 'interviewed', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Setting Up Environment Variables

Create a `.env` file with these variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=jobplex
DB_SSL=true

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
```

## Running Locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build TypeScript files**
   ```bash
   npm run build
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Or with nodemon for auto-restarting:
   ```bash
   npm start
   ```

## Docker Setup

```bash
# Build Docker image
docker build -t jobplex-backend .

# Run Docker container
docker run -p 3000:3000 --env-file .env jobplex-backend
```

The Dockerfile is already set up:

```dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

## Error Handling

All routes are protected by centralized error handling middleware:

```typescript
// error.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: 'Resource not found' });
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
};
```

## API Testing

You can use tools like Postman or curl to test your API endpoints:

```bash
# Example: Login request
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Example: Get jobs with authorization
curl -X GET http://localhost:3000/api/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Deployment to AWS EC2

The backend is already deployed and accessible at:
- URL: http://18.208.134.30/api
- Port: 80

## Security Considerations

- All passwords are hashed using bcrypt before storing
- JWT tokens are used for authentication
- CORS is configured to allow requests from the frontend
- Helmet is used to set security headers
- Input validation is performed on all endpoints
- SQL injection protection using parameterized queries

## Future Enhancements

- Add AI matching algorithm using ChatGPT/Gemini APIs
- Implement real-time notifications with WebSockets
- Add analytics dashboard for employers
- Implement job recommendation engine for job seekers
- Add resume parsing functionality

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request
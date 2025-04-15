# Jobplex

An AI-powered job matching platform built with Angular 19 that connects job seekers with employers based on skills rather than job titles.

## Project Overview

Jobplex (based on SkillMatch AI concept) revolutionizes the hiring process by focusing on skills rather than traditional resume metrics. The platform uses AI to match candidates with opportunities based on actual abilities and potential.

## Technology Stack

- **Frontend**: Angular 19 with standalone components
- **Styling**: Tailwind CSS
- **Backend**: Node.js with Express (containerized with Docker)
- **Database**: PostgreSQL (containerized with Docker)
- **Authentication**: JWT with role-based access control
- **AI Integration**: ChatGPT and Gemini APIs
- **Containerization**: Docker with Docker Compose

## Project Structure

### Frontend Structure (Angular)

```
jobplex/
├── src/
│   ├── app/
│   │   ├── components/                # Reusable components
│   │   │   ├── header/                # App header
│   │   │   ├── footer/                # App footer
│   │   │   ├── skill-badge/           # Skill display component
│   │   │   ├── job-card/              # Job listing card
│   │   │   └── notification/          # Notification component
│   │   │
│   │   ├── pages/                     # Main pages
│   │   │   ├── home/                  # Landing page
│   │   │   ├── auth-screen/           # Combined login/registration page
│   │   │   ├── forgot-password/       # Password recovery
│   │   │   │
│   │   │   ├── jobseeker/             # Job seeker pages
│   │   │   │   ├── dashboard/         # Main dashboard
│   │   │   │   ├── my-portfolio/      # Portfolio with skills management
│   │   │   │   ├── jobs-explorer/     # Job search and matches
│   │   │   │   ├── ai-career-path/    # AI-powered career guidance
│   │   │   │   ├── cv-manager/        # CV upload and management
│   │   │   │   ├── my-profile/        # Profile management
│   │   │   │   ├── settings/          # Account settings
│   │   │   │   └── interviews/        # Interview notifications
│   │   │   │
│   │   │   ├── employer/              # Employer pages
│   │   │   │   ├── dashboard/         # Main dashboard
│   │   │   │   ├── profile/           # Company profile
│   │   │   │   ├── job-posts/         # Job posting management
│   │   │   │   ├── candidate-matches/ # View matched candidates
│   │   │   │   ├── chat-interface/    # AI chat for queries
│   │   │   │   ├── interviews/        # Interview scheduling
│   │   │   │   └── analytics/         # Hiring analytics
│   │   │   │
│   │   │   └── admin/                 # Admin pages
│   │   │       ├── dashboard/         # Admin dashboard
│   │   │       ├── user-management/   # User management
│   │   │       ├── security/          # Security settings
│   │   │       ├── ai-monitoring/     # AI performance monitoring
│   │   │       └── system-metrics/    # System performance metrics
│   │   │
│   │   ├── services/                  # Services for API calls
│   │   │   ├── auth.service.ts        # Authentication
│   │   │   ├── job.service.ts         # Job related API calls
│   │   │   ├── user.service.ts        # User related API calls
│   │   │   ├── skill.service.ts       # Skills management
│   │   │   ├── chat.service.ts        # AI chat functionality
│   │   │   └── notification.service.ts # Notifications
│   │   │
│   │   ├── interfaces/                # TypeScript interfaces
│   │   │   ├── user.interface.ts      # User data structure
│   │   │   ├── job.interface.ts       # Job data structure
│   │   │   ├── skill.interface.ts     # Skills data structure
│   │   │   └── application.interface.ts # Application data structure
│   │   │
│   │   ├── app.routes.ts              # Main routes
│   │   ├── app.config.ts              # App configuration
│   │   └── app.component.ts           # Root component
│   │
│   ├── assets/                        # Images and static files
│   │   └── images/
│   │
│   ├── styles/                        # Global styles
│   │   └── tailwind.scss              # Tailwind imports
│   │
│   ├── index.html                     # Main HTML file
│   └── main.ts                        # Entry point
│
├── tailwind.config.js                 # Tailwind configuration
├── package.json                       # Dependencies
└── README.md                          # Project documentation
```

### Backend Structure (Node.js/Express with Docker)

```
server/
├── controllers/                     # Request handlers
│   ├── auth.controller.js           # Authentication logic
│   ├── user.controller.js           # User management
│   ├── job.controller.js            # Job posting/matching
│   ├── skill.controller.js          # Skills management
│   ├── application.controller.js    # Job applications
│   ├── interview.controller.js      # Interview management
│   └── ai.controller.js             # AI integration endpoints
│
├── db/                              # Database scripts
│   ├── schema.sql                   # Database schema
│   ├── seed.sql                     # Seed data
│   └── index.js                     # Database connection
│
├── routes/                          # API routes
│   ├── auth.routes.js               # Auth endpoints
│   ├── user.routes.js               # User endpoints
│   ├── job.routes.js                # Job endpoints
│   ├── skill.routes.js              # Skills endpoints
│   └── ai.routes.js                 # AI integration endpoints
│
├── middleware/                      # Middleware functions
│   ├── auth.middleware.js           # Authentication middleware
│   └── role.middleware.js           # Role-based access control
│
├── services/                        # Business logic
│   ├── match.service.js             # Job matching algorithm
│   ├── ai.service.js                # AI integration
│   └── notification.service.js      # Email notifications
│
├── config/                          # Configuration files
│   └── db.config.js                 # Database connection
│
├── server.js                        # Main server file
├── Dockerfile                       # Docker configuration for Node.js
├── .dockerignore                    # Files to exclude from Docker image
└── package.json                     # Dependencies
```

### Docker Structure

```
jobplex/
├── docker-compose.yml               # Docker Compose configuration
├── .env                             # Environment variables for Docker
├── docker/                          # Additional Docker configuration
│   ├── postgres/                    # PostgreSQL Docker setup
│   │   ├── Dockerfile               # PostgreSQL customization
│   │   └── init/                    # Initialization scripts
│   │       ├── 01-schema.sql        # Database schema
│   │       └── 02-seed.sql          # Initial seed data
│   └── nginx/                       # Nginx for production
│       ├── Dockerfile               # Nginx configuration
│       └── default.conf             # Nginx server configuration
└── README.md                        # Project documentation
```

## Page Details

### Job Seeker Pages

1. **Dashboard**
   - Overview of profile completion
   - Recent job matches
   - Application status
   - Upcoming interviews
   - Career recommendations
   - Activity summary
   - Notification center

2. **My Portfolio**
   - Skills management with proficiency levels
   - Projects showcase
   - Work samples and achievements
   - Certifications display
   - Skill endorsements
   - Skill assessment results
   - Portfolio visibility settings

3. **Jobs Explorer**
   - AI-matched job opportunities
   - Advanced job search filters
   - Match score indicators
   - Job details and requirements
   - Save job functionality
   - Application tracking
   - Company information
   - Similar jobs recommendations

4. **AI-Career Path**
   - AI-recommended career trajectories
   - Skill gap analysis
   - Growth opportunities visualization
   - Learning resources and courses
   - Industry trends and insights
   - Salary information for career paths
   - Timeline projections

5. **CV Manager**
   - Document upload interface
   - AI-powered skill extraction
   - CV parsing results visualization
   - CV version management
   - ATS optimization suggestions
   - CV templates and formatting
   - Download and sharing options

6. **My Profile**
   - Personal information management
   - Professional summary editor
   - Work experience timeline
   - Education history
   - Contact details
   - Social media links
   - Privacy controls

7. **Settings**
   - Account preferences
   - Notification settings
   - Privacy controls
   - Password management
   - Connected accounts
   - Data export options
   - Account deletion

8. **Interviews**
   - Interview schedule calendar
   - Interview preparation resources
   - Interview notification settings
   - Interview feedback tracking
   - Mock interview tools
   - Interview notes storage

### Employer Pages

1. **Dashboard**
   - Overview of active job posts
   - Recent candidate matches
   - Interview schedule
   - Hiring analytics summary
   - Team activity feed
   - Urgent actions required

2. **Company Profile**
   - Company information and branding
   - Culture and values description
   - Team members showcase
   - Working environment details
   - Benefits and perks listing
   - Company photos and videos
   - Social responsibility initiatives

3. **Job Posts Management**
   - Create/edit job posts
   - Required skills selection
   - Job post status tracking
   - Application statistics
   - Job post templates
   - Multi-channel publishing options
   - Duplicate and archive functionality

4. **Candidate Matches**
   - AI-matched candidates list
   - Match score details and explanation
   - Candidate profiles viewer
   - Shortlisting and tagging tools
   - Bulk actions for candidates
   - Collaboration tools for hiring teams
   - Custom screening questions

5. **Chat Interface**
   - Natural language query system
   - Candidate search by skills
   - Experience filtering
   - Skill combination queries
   - Saved searches
   - Market insights
   - Recruitment strategy suggestions

6. **Interview Scheduling**
   - Calendar integration
   - Candidate availability checker
   - Interview type selection
   - Automated notifications
   - Interview panel coordination
   - Room booking integration
   - Interview feedback collection

7. **Hiring Analytics**
   - Application trends visualization
   - Match quality metrics
   - Time-to-hire analysis
   - Source effectiveness comparison
   - Diversity metrics
   - Cost-per-hire calculations
   - Candidate experience feedback

### Admin Pages

1. **Dashboard**
   - Platform activity overview
   - User statistics and growth
   - System performance metrics
   - AI effectiveness summary
   - Critical alerts
   - Upcoming maintenance
   - Feature adoption rates

2. **User Management**
   - User accounts list
   - Account verification tools
   - Role assignment controls
   - Account status management
   - Bulk actions
   - User search and filtering
   - Account history

3. **Security Settings**
   - Authentication configuration
   - Password policies management
   - Access logs review
   - Security alerts configuration
   - Two-factor authentication settings
   - IP restrictions
   - Session management

4. **AI Monitoring**
   - Match accuracy metrics
   - AI model performance tracking
   - Training data management
   - Algorithm adjustments interface
   - Feedback processing
   - Error correction tools
   - A/B testing configuration

5. **System Metrics**
   - Server performance dashboards
   - Database health monitoring
   - API response times tracking
   - Error monitoring and alerts
   - Resource utilization
   - Capacity planning
   - Automated testing results

## Auth Screen Details

The AuthScreen component combines login and registration functionality in a single interface with:
- Tab-based UI to switch between login and signup forms
- Responsive design for all devices
- Form validation with error messages
- Social login integration
- User role selection during signup (Job Seeker/Employer)
- Password strength indicator
- Terms and conditions acceptance
- Remember me functionality
- Password recovery option

## Getting Started

### Frontend Setup

1. **Set up Angular project**
   ```bash
   npm install -g @angular/cli
   ng new jobplex
   cd jobplex
   ```

2. **Add Tailwind CSS**
   ```bash
   npm install -D tailwindcss
   npx tailwindcss init
   ```
   
   Configure `tailwind.config.js`:
   ```javascript
   module.exports = {
     content: ["./src/**/*.{html,ts}"],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

3. **Create Auth Screen Component**
   ```bash
   ng generate component pages/auth-screen --standalone
   ```

4. **Start development server**
   ```bash
   ng serve
   ```

### Backend Setup with Docker

1. **Install Docker and Docker Compose**
   - Follow the installation guide at [Docker's official website](https://docs.docker.com/get-docker/)
   - Install Docker Compose from [Docker Compose installation guide](https://docs.docker.com/compose/install/)

2. **Create Docker Configuration Files**

   **Create Dockerfile for Node.js backend**
   ```dockerfile
   # server/Dockerfile
   FROM node:18-alpine

   # Create app directory
   WORKDIR /usr/src/app

   # Install app dependencies
   COPY package*.json ./
   RUN npm install

   # Bundle app source
   COPY . .

   # Expose API port
   EXPOSE 3000

   # Command to run the application
   CMD ["node", "server.js"]
   ```

   **Create .dockerignore file**
   ```
   # server/.dockerignore
   node_modules
   npm-debug.log
   ```

   **Create Docker Compose configuration**
   ```yaml
   # docker-compose.yml
   version: '3.8'

   services:
     # Backend API service
     api:
       build:
         context: ./server
         dockerfile: Dockerfile
       ports:
         - "3000:3000"
       environment:
         NODE_ENV: development
         DB_HOST: postgres
         DB_PORT: 5432
         DB_USER: postgres
         DB_PASSWORD: postgres
         DB_NAME: jobplex
       volumes:
         - ./server:/usr/src/app
         - /usr/src/app/node_modules
       depends_on:
         - postgres
       restart: unless-stopped

     # PostgreSQL Database
     postgres:
       image: postgres:15-alpine
       ports:
         - "5432:5432"
       environment:
         POSTGRES_PASSWORD: postgres
         POSTGRES_USER: postgres
         POSTGRES_DB: jobplex
       volumes:
         - postgres_data:/var/lib/postgresql/data
         - ./docker/postgres/init:/docker-entrypoint-initdb.d
       restart: unless-stopped

     # PgAdmin for database management (optional)
     pgadmin:
       image: dpage/pgadmin4
       environment:
         PGADMIN_DEFAULT_EMAIL: admin@jobplex.com
         PGADMIN_DEFAULT_PASSWORD: admin
       ports:
         - "5050:80"
       depends_on:
         - postgres
       restart: unless-stopped

   volumes:
     postgres_data:
   ```

3. **Create PostgreSQL initialization scripts**

   Create directory for initialization scripts:
   ```bash
   mkdir -p docker/postgres/init
   ```

   Copy your schema and seed SQL files:
   ```bash
   cp server/db/schema.sql docker/postgres/init/01-schema.sql
   cp server/db/seed.sql docker/postgres/init/02-seed.sql
   ```

4. **Create environment file for Docker**
   ```bash
   # .env
   # PostgreSQL Environment Variables
   POSTGRES_PASSWORD=postgres
   POSTGRES_USER=postgres
   POSTGRES_DB=jobplex

   # Node API Environment Variables
   NODE_ENV=development
   DB_HOST=postgres
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=jobplex
   ```

5. **Update database configuration**

   Update `server/config/db.config.js` to use environment variables:
   ```javascript
   module.exports = {
     host: process.env.DB_HOST || 'localhost',
     port: process.env.DB_PORT || 5432,
     database: process.env.DB_NAME || 'jobplex',
     user: process.env.DB_USER || 'postgres',
     password: process.env.DB_PASSWORD || 'postgres',
   };
   ```

6. **Start the Docker containers**
   ```bash
   docker-compose up -d
   ```

7. **Access the services**
   - Backend API: http://localhost:3000
   - PgAdmin: http://localhost:5050 (login with admin@jobplex.com / admin)

8. **View logs**
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f api
   ```

9. **Stop the containers**
   ```bash
   docker-compose down
   ```

## Development Workflow

1. **Frontend Development**
   - Make changes to the Angular application
   - Run `ng serve` to test changes locally
   - Angular app will be available at http://localhost:4200

2. **Backend Development**
   - Make changes to the Node.js application
   - Changes are automatically applied due to volume mounting in Docker Compose
   - If you need to restart the container: `docker-compose restart api`
   - Backend API will be available at http://localhost:3000

3. **Database Management**
   - Access PgAdmin at http://localhost:5050
   - Connect to the PostgreSQL server using the server address: `postgres`
   - Use the credentials defined in the environment variables

## Production Deployment

For production deployment, we can extend our Docker setup:

1. **Create production Docker Compose file**
   ```yaml
   # docker-compose.prod.yml
   version: '3.8'

   services:
     # Frontend web server with Nginx
     web:
       build:
         context: ./
         dockerfile: docker/nginx/Dockerfile
       ports:
         - "80:80"
         - "443:443"
       depends_on:
         - api
       restart: unless-stopped

     # Backend API service
     api:
       build:
         context: ./server
         dockerfile: Dockerfile
       environment:
         NODE_ENV: production
         DB_HOST: postgres
         DB_PORT: 5432
         DB_USER: ${POSTGRES_USER}
         DB_PASSWORD: ${POSTGRES_PASSWORD}
         DB_NAME: ${POSTGRES_DB}
       depends_on:
         - postgres
       restart: unless-stopped

     # PostgreSQL Database
     postgres:
       image: postgres:15-alpine
       environment:
         POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
         POSTGRES_USER: ${POSTGRES_USER}
         POSTGRES_DB: ${POSTGRES_DB}
       volumes:
         - postgres_data:/var/lib/postgresql/data
       restart: unless-stopped

   volumes:
     postgres_data:
   ```

2. **Create Nginx Dockerfile and configuration**
   ```dockerfile
   # docker/nginx/Dockerfile
   FROM node:18-alpine AS build

   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build --prod

   FROM nginx:alpine
   COPY --from=build /app/dist/jobplex /usr/share/nginx/html
   COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

   ```
   # docker/nginx/default.conf
   server {
       listen 80;
       server_name localhost;
       root /usr/share/nginx/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://api:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Deploy to production**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Timeline

- **Frontend Development**: By April 13, 2025
- **Backend & Docker Setup**: By April 17, 2025
- **AI Integration**: By April 20, 2025
- **Testing & Deployment**: April 21-23, 2025
- **Final Presentation**: April 24, 2025
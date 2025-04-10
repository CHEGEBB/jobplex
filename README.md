# Jobplex

An AI-powered job matching platform built with Angular 19 that connects job seekers with employers based on skills rather than job titles.

## Project Overview

Jobplex (based on SkillMatch AI concept) revolutionizes the hiring process by focusing on skills rather than traditional resume metrics. The platform uses AI to match candidates with opportunities based on actual abilities and potential.

## Technology Stack

- **Frontend**: Angular 19 with standalone components
- **Styling**: Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT with role-based access control
- **AI Integration**: ChatGPT and Gemini APIs

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
│   │   │   │   ├── profile/           # Profile management
│   │   │   │   ├── skills/            # Skills management
│   │   │   │   ├── job-matches/       # Matched jobs
│   │   │   │   ├── applications/      # Job applications
│   │   │   │   ├── portfolio/         # Portfolio management
│   │   │   │   ├── cv-upload/         # CV upload and management
│   │   │   │   ├── interviews/        # Interview notifications
│   │   │   │   └── career-paths/      # Career guidance
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

### Backend Structure (Node.js/Express)

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
└── package.json                     # Dependencies
```

## Page Details

### Job Seeker Pages

1. **Dashboard**
   - Overview of profile completion
   - Recent job matches
   - Application status
   - Upcoming interviews
   - Career recommendations

2. **Profile Management**
   - Personal information
   - Professional summary
   - Work experience
   - Education
   - Contact details

3. **Skills Management**
   - Add/edit skills with proficiency levels
   - Skill endorsements
   - Skill assessment tests

4. **Job Matches**
   - AI-matched job opportunities
   - Match score indicators
   - Job details and requirements
   - Apply functionality

5. **Applications**
   - Applied jobs list
   - Application status tracking
   - Interview schedule
   - Feedback received

6. **Portfolio Management**
   - Projects showcase
   - Work samples
   - Achievements
   - Certifications

7. **CV Upload**
   - Document upload interface
   - AI-powered skill extraction
   - CV parsing results
   - CV version management

8. **Interviews**
   - Interview schedule
   - Interview preparation tips
   - Interview notification settings
   - Interview feedback

9. **Career Paths**
   - AI-recommended career paths
   - Skill gap analysis
   - Growth opportunities
   - Learning resources

### Employer Pages

1. **Dashboard**
   - Overview of active job posts
   - Recent candidate matches
   - Interview schedule
   - Hiring analytics summary

2. **Company Profile**
   - Company information
   - Culture and values
   - Team members
   - Working environment

3. **Job Posts Management**
   - Create/edit job posts
   - Required skills selection
   - Job post status
   - Application statistics

4. **Candidate Matches**
   - AI-matched candidates
   - Match score details
   - Candidate profiles
   - Shortlisting tools

5. **Chat Interface**
   - Natural language query system
   - Candidate search by skills
   - Experience filtering
   - Skill combination queries

6. **Interview Scheduling**
   - Calendar integration
   - Candidate availability
   - Interview type selection
   - Automated notifications

7. **Hiring Analytics**
   - Application trends
   - Match quality metrics
   - Time-to-hire analysis
   - Source effectiveness

### Admin Pages

1. **Dashboard**
   - Platform activity overview
   - User statistics
   - System performance metrics
   - AI effectiveness summary

2. **User Management**
   - User accounts list
   - Account verification
   - Role assignment
   - Account status control

3. **Security Settings**
   - Authentication settings
   - Password policies
   - Access logs
   - Security alerts

4. **AI Monitoring**
   - Match accuracy metrics
   - AI model performance
   - Training data management
   - Algorithm adjustments

5. **System Metrics**
   - Server performance
   - Database health
   - API response times
   - Error monitoring

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

## Getting Started

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

## Backend Setup

1. **Set up Node.js project**
   ```bash
   mkdir server
   cd server
   npm init -y
   npm install express pg cors bcrypt jsonwebtoken
   ```

2. **Set up PostgreSQL database**
   ```bash
   # After installing PostgreSQL
   psql -U postgres
   CREATE DATABASE jobplex;
   \c jobplex
   # Run schema.sql script
   ```

3. **Start backend server**
   ```bash
   node server.js
   ```

## Timeline

- **Frontend Development**: By April 13, 2025
- **Backend & AI Integration**: By April 20, 2025
- **Testing & Deployment**: April 21-23, 2025
- **Final Presentation**: April 24, 2025
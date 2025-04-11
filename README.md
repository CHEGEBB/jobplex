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
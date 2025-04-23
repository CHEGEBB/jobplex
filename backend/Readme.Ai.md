# JobPlex AI Integration

This document outlines the integration of Google's Gemini AI into the JobPlex backend to power two key features:

1. **For Job Seekers**: AI-recommended career paths based on user skills and qualifications
2. **For Employers**: AI-powered candidate matching based on job requirements and skills

## Overview

The AI integration will be kept simple by adding a single AI controller to the existing backend. This minimalist approach ensures easier maintenance and troubleshooting.

## Backend Implementation

We'll add a single new file to the existing backend structure:

```
jobplex-backend/
├── src/
│   ├── controllers/
│   │   └── ai.controller.ts     # All AI functionality in one file
│   │
│   ├── routes/
│   │   └── ai.routes.ts         # All AI endpoints
│   │
│   └── server.ts                # Updated to include AI routes
│
├── .env                         # Updated with GEMINI_API_KEY
```

## AI Controller Implementation

The `ai.controller.ts` file will contain all AI-related functionality:

1. **Career path recommendations** for job seekers
2. **Candidate matching** for employers

## API Endpoints

### For Job Seekers

- **Endpoint**: `POST /api/ai/career-path`
- **Authentication**: Required (job seeker only)
- **Description**: Gets AI-recommended career paths based on user's skills
- **Request**: Uses the authenticated user's skills from the database
- **Response**: Returns recommended career paths with skill gaps and learning resources

### For Employers

- **Endpoint**: `POST /api/ai/match-candidates`
- **Authentication**: Required (employer only)
- **Description**: Matches candidates to job postings based on skills
- **Request**: Job ID to match candidates against
- **Response**: Returns ranked candidates with match percentages

## Gemini API Setup

To set up the Gemini API:

1. Visit Google AI Studio to create an API key
2. Add the key to your `.env` file:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. Install the Gemini API client:
   ```
   npm install @google/generative-ai
   ``` 
For job seekers, the AI will:
- Analyze the user's current skills from the database
- Generate recommended career paths
- Identify skill gaps to fill
- Suggest learning resources

## Candidate Matching

For employers, the AI will:
- Extract required skills from job posting 
- Find candidates with matching skills using database queries (postgresql)
- Calculate match percentages
- Rank candidates by suitability

## Database Integration

The AI controller will use the existing database connection to:
1. Fetch job seeker skills for career recommendations
2. Get job requirements for candidate matching
3. Find candidates with matching skills

## Deployment

The updated backend will be deployed to the existing AWS EC2 instance:
- URL: http://18.208.134.30/api
- New endpoints will be available at:
  - http://18.208.134.30/api/ai/career-path
  - http://18.208.134.30/api/ai/match-candidates

## Security Considerations

- The Gemini API key will be stored in environment variables
- All AI endpoints will require authentication
- Rate limiting will be implemented to prevent API abuse

## Next Steps

After implementing the backend:
1. Update the Angular frontend to call these new endpoints
2. Create UI components to display the AI recommendations
3. Implement user feedback mechanisms to improve AI accuracy
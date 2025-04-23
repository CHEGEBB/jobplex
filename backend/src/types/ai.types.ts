// src/types/ai.types.ts
export interface LearningResource {
    name: string;
    type: string; // "course" | "book" | "certification" | "website"
    description: string;
  }
  
  export interface CareerPath {
    title: string;
    description: string;
    matchPercentage: number;
    skillGaps: string[];
    learningResources: LearningResource[];
  }
  
  export interface JobSeekerCareerPathResponse {
    careerPaths: CareerPath[];
    analysis: string;
  }
  
  export interface CandidateMatch {
    id: string | number;
    name: string;
    matchPercentage: number;
    matchReason: string;
    missingSkills: string[];
  }
  
  export interface EmployerCandidateMatchResponse {
    candidates: CandidateMatch[];
  }
  
  // Extend Express Request to include user property
  declare global {
    namespace Express {
      interface Request {
        user?: {
          id: number;
          email: string;
          role: string;
        };
      }
    }
  }
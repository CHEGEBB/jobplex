// src/types/ai.types.ts
export interface LearningResource {
  name: string;
  type: string;
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
  id: number;
  name: string;
  matchPercentage: number;
  matchReason: string;
  missingSkills: string[];
}

export interface EmployerCandidateMatchResponse {
  candidates: CandidateMatch[];
}

export interface EmployerChatResponse {
  message: string;
  matchedCandidates: {
    id: number;
    name: string;
    matchPercentage: number;
    relevantSkills: string[];
    experience: string;
    appliedToJobs?: string[];
  }[];
  suggestedFollowup: string[];
}

export interface SavedChatQuery {
  id: number;
  query: string;
  response: EmployerChatResponse;
  created_at: string;
}
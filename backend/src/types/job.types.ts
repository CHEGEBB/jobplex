// src/types/job.types.ts
export interface Job {
    id: number;
    employerId: number;
    title: string;
    description: string;
    location: string | null;
    salaryRange: string | null;
    jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface JobSkill {
    id: number;
    jobId: number;
    skillName: string;
    importance: 'required' | 'preferred' | 'nice-to-have';
    createdAt: Date;
  }
  
  export interface CreateJobRequest {
    title: string;
    description: string;
    location?: string;
    salaryRange?: string;
    jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
    skills: {
      skillName: string;
      importance: 'required' | 'preferred' | 'nice-to-have';
    }[];
  }
  
  export interface UpdateJobRequest {
    title?: string;
    description?: string;
    location?: string;
    salaryRange?: string;
    jobType?: 'full-time' | 'part-time' | 'contract' | 'internship';
    skills?: {
      skillName: string;
      importance: 'required' | 'preferred' | 'nice-to-have';
    }[];
  }
  
  export interface JobApplication {
    id: number;
    jobId: number;
    userId: number;
    status: 'pending' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface JobWithSkills extends Job {
    skills: {
      skillName: string;
      importance: 'required' | 'preferred' | 'nice-to-have';
    }[];
  }
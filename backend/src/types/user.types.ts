// src/types/user.types.ts
export interface User {
    id: number;
    email: string;
    password: string;
    role: 'job_seeker' | 'employer' | 'admin';
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface JobSeekerProfile {
    id: number;
    userId: number;
    title: string | null;
    bio: string | null;
    location: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface EmployerProfile {
    id: number;
    userId: number;
    companyName: string;
    companySize: string | null;
    industry: string | null;
    location: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface UserProfile {
    id: number;
    email: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    profile: JobSeekerProfile | EmployerProfile | null;
  }
  
  export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    title?: string;
    bio?: string;
    location?: string;
    companyName?: string;
    companySize?: string;
    industry?: string;
  }
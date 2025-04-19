// src/types/portfolio.types.ts
export interface Skill {
    id: number;
    user_id: number;
    name: string;
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    years_experience: number;
    created_at?: Date;
    updated_at?: Date;
  }
  
  export interface CreateSkillRequest {
    name: string;
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    years_experience: number;
  }
  
  export interface Project {
    id: number;
    user_id: number;
    title: string;
    description: string;
    skills: string[];
    github?: string;
    link?: string;
    image: string;
    featured: boolean;
    created_at?: Date;
    updated_at?: Date;
  }
  
  export interface CreateProjectRequest {
    title: string;
    description: string;
    skills: string[];
    github?: string;
    link?: string;
    image?: string;
    featured: boolean;
  }
  
  export interface Certificate {
    id: number;
    user_id: number;
    name: string;
    issuer: string;
    date: string;
    expiry?: string;
    credential_id?: string;
    link?: string;
    created_at?: Date;
    updated_at?: Date;
  }
  
  export interface CreateCertificateRequest {
    name: string;
    issuer: string;
    date: string;
    expiry?: string;
    credential_id?: string;
    link?: string;
  }
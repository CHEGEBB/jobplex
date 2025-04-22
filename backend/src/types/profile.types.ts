// src/types/profile.types.ts
export interface UserProfile {
    id: number;
    user_id: number;
    title: string | null;
    bio: string | null;
    location: string | null;
    phone: string | null;
    website: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    profile_photo_url: string | null;
    resume_url: string | null;
    availability: string | null;
    desired_salary_range: string | null;
    is_remote_ok: boolean;
    willing_to_relocate: boolean;
    years_of_experience: number | null;
    education_level: string | null;
    preferred_job_types: string[] | null;
    preferred_industries: string[] | null;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface UserSkill {
    id: number;
    user_id: number;
    name: string;
    proficiency: string;
    years_experience: number;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface WorkExperience {
    id: number;
    user_id: number;
    company_name: string;
    position: string;
    location: string | null;
    start_date: Date;
    end_date: Date | null;
    is_current: boolean;
    description: string | null;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface Education {
    id: number;
    user_id: number;
    institution: string;
    degree: string;
    field_of_study: string;
    start_date: Date;
    end_date: Date | null;
    is_current: boolean;
    description: string | null;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface UserDocument {
    id: number;
    user_id: number;
    document_type: string;
    document_url: string;
    filename: string;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface ProfileUpdateData {
    title?: string;
    bio?: string;
    location?: string;
    phone?: string;
    website?: string;
    linkedin_url?: string;
    github_url?: string;
    availability?: string;
    desired_salary_range?: string;
    is_remote_ok?: boolean;
    willing_to_relocate?: boolean;
    years_of_experience?: number;
    education_level?: string;
    preferred_job_types?: string[];
    preferred_industries?: string[];
  }
  
  export interface SkillData {
    name: string;
    proficiency: string;
    years_experience: number;
  }
  
  export interface ExperienceData {
    company_name: string;
    position: string;
    location?: string;
    start_date: Date;
    end_date?: Date;
    is_current: boolean;
    description?: string;
  }
  
  export interface EducationData {
    institution: string;
    degree: string;
    field_of_study: string;
    start_date: Date;
    end_date?: Date;
    is_current: boolean;
    description?: string;
  }
  
  export interface DocumentData {
    document_type: string;
    document_url: string;
    filename: string;
  }
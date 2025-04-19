// src/types/skill.types.ts
export interface Skill {
    id: number;
    userId: number;
    name: string;
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsExperience: number | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CreateSkillRequest {
    name: string;
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsExperience?: number;
  }
  
  export interface UpdateSkillRequest {
    name?: string;
    proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsExperience?: number;
  }
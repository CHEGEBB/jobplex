// src/interfaces/skill.interface.ts
export enum SkillCategory {
  TECHNICAL = 'technical',
  SOFT = 'soft',
  LANGUAGE = 'language',
  TOOL = 'tool'
}

export interface Skill {
  id?: number;
  name: string;
  level: number;
  category: SkillCategory | string;
  yearsExperience?: number;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SkillCreateDTO {
  name: string;
  level: number;
  category: SkillCategory | string;
  yearsExperience?: number;
}

export interface SkillUpdateDTO {
  name?: string;
  level?: number;
  category?: SkillCategory | string;
  yearsExperience?: number;
}
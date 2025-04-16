export interface IJob {
    id?: number;
    title: string;
    description: string;
    company: string;
    location: string;
    salary?: string;
    employerId: number;
    employmentType: string;
    experienceLevel: string;
    status: 'open' | 'closed' | 'draft';
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface IJobWithSkills extends IJob {
    skills: string[];
  }
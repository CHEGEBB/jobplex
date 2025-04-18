// export interface ISkill {
//     id?: number;
//     name: string;
//     category: string;
//     createdAt?: Date;
//     updatedAt?: Date;
//   }
  
//   export interface IUserSkill {
//     id?: number;
//     userId: number;
//     skillId: number;
//     proficiencyLevel: number;
//     yearsOfExperience?: number;
//     createdAt?: Date;
//     updatedAt?: Date;
//   }
  
//   export interface IJobSkill {
//     id?: number;
//     jobId: number;
//     skillId: number;
//     importance: number;
//     createdAt?: Date;
//     updatedAt?: Date;
//   }


  export interface ISkill {
    id?: number;
    name: string;
    category: 'technical' | 'soft' | 'language' | 'tool';
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface IUserSkill {
    id?: number;
    userId: number;
    skillId: number;
    proficiencyLevel: number; // 1-5
    yearsOfExperience?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }
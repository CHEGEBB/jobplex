export enum UserRole {
    JOBSEEKER = 'jobseeker',
    EMPLOYER = 'employer',
    ADMIN = 'admin'
  }
  
  export interface IUser {
    id?: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    company?: string;
    position?: string;
    location?: string;
    bio?: string;
    phone?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface IUserResponse {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    company?: string;
    position?: string;
    location?: string;
    bio?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
  }
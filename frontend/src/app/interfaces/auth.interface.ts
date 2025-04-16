// src/app/interfaces/auth.interface.ts
export interface LoginCredentials {
    email: string;
    password: string;
    role: 'jobseeker' | 'employer' | 'admin';
  }
  
  export interface SignupData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'jobseeker' | 'employer' | 'admin';
    companyName?: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    data: {
      user: User;
      token: string;
    };
  }
  
  export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'jobseeker' | 'employer' | 'admin';
    company?: string;
    position?: string;
    location?: string;
    bio?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
  }
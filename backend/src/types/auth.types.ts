// src/types/auth.types.ts
export interface UserPayload {
    id: number;
    email: string;
    role: 'job_seeker' | 'employer' | 'admin';
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface RegisterRequest {
    email: string;
    password: string;
    role: 'jobseeker' | 'employer';
    firstName: string;
    lastName: string;
  }
  
  export interface ForgotPasswordRequest {
    email: string;
  }
  
  export interface ResetPasswordRequest {
    token: string;
    password: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: {
      id: number;
      email: string;
      role: string;
      firstName: string | null;
      lastName: string | null;
    };
  }
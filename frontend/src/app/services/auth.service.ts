// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoginCredentials, SignupData, AuthResponse, User } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  constructor(private http: HttpClient) {
    // Initialize user from localStorage if available
    const userData = localStorage.getItem(this.USER_KEY);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      userData ? JSON.parse(userData) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    // Initialize authentication state
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getToken());
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  // Register a new user
  register(signupData: SignupData): Observable<AuthResponse> {
    const payload = {
      ...signupData,
      // Add company field for employer role
      ...(signupData.role === 'employer' && signupData.companyName 
          ? { company: signupData.companyName } 
          : {})
    };
    
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, payload).pipe(
      catchError(error => {
        console.error('Registration error', error);
        return throwError(() => new Error(error.error?.message || 'Registration failed'));
      })
    );
  }

  // Login user
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data.token) {
          this.setAuthData(response.data.token, response.data.user);
        }
      }),
      catchError(error => {
        console.error('Login error', error);
        return throwError(() => new Error(error.error?.message || 'Login failed'));
      })
    );
  }

  // Google OAuth login
  loginWithGoogle(role: 'jobseeker' | 'employer' | 'admin'): Observable<AuthResponse> {
    // This would typically redirect to Google OAuth flow
    // For now we'll simulate with a direct API call
    return this.http.post<AuthResponse>(`${this.API_URL}/google-auth`, { role }).pipe(
      tap(response => {
        if (response.success && response.data.token) {
          this.setAuthData(response.data.token, response.data.user);
        }
      }),
      catchError(error => {
        console.error('Google login error', error);
        return throwError(() => new Error(error.error?.message || 'Google login failed'));
      })
    );
  }

  // LinkedIn OAuth login
  loginWithLinkedIn(role: 'jobseeker' | 'employer' | 'admin'): Observable<AuthResponse> {
    // This would typically redirect to LinkedIn OAuth flow
    // For now we'll simulate with a direct API call
    return this.http.post<AuthResponse>(`${this.API_URL}/linkedin-auth`, { role }).pipe(
      tap(response => {
        if (response.success && response.data.token) {
          this.setAuthData(response.data.token, response.data.user);
        }
      }),
      catchError(error => {
        console.error('LinkedIn login error', error);
        return throwError(() => new Error(error.error?.message || 'LinkedIn login failed'));
      })
    );
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  // Request password reset
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/forgot-password`, { email }).pipe(
      catchError(error => {
        console.error('Password reset request error', error);
        return throwError(() => new Error(error.error?.message || 'Password reset request failed'));
      })
    );
  }

  // Reset password with token
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/reset-password`, { 
      token, 
      password: newPassword 
    }).pipe(
      catchError(error => {
        console.error('Password reset error', error);
        return throwError(() => new Error(error.error?.message || 'Password reset failed'));
      })
    );
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get JWT token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get user role
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  // Store auth data in localStorage
  private setAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }
}
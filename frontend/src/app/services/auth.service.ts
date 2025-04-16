// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

// User interface to type the response from the API
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

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  
  // BehaviorSubject to track authentication state across the app
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // BehaviorSubject to track if user is authenticated
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize auth state from localStorage on service creation
    this.loadUserFromStorage();
  }

  // Check if the user is logged in
  get isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Get the current user
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Get the auth token
  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Register a new user
  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Login a user
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setSession(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Login with Google
  loginWithGoogle(): Observable<AuthResponse> {
    // This would typically redirect to Google OAuth
    // For now, we'll just return an error as this would be implemented with OAuth
    return throwError(() => new Error('Google login not implemented'));
  }

  // Login with LinkedIn
  loginWithLinkedIn(): Observable<AuthResponse> {
    // This would typically redirect to LinkedIn OAuth
    // For now, we'll just return an error as this would be implemented with OAuth
    return throwError(() => new Error('LinkedIn login not implemented'));
  }

  // Set the session data after successful login
  private setSession(authData: { user: User; token: string }): void {
    localStorage.setItem(this.tokenKey, authData.token);
    localStorage.setItem(this.userKey, JSON.stringify(authData.user));
    
    this.currentUserSubject.next(authData.user);
    this.isAuthenticatedSubject.next(true);
  }

  // Load user from localStorage on service init
  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userData = localStorage.getItem(this.userKey);
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData) as User;
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (e) {
        this.logout(); // Invalid user data in storage
      }
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    // Navigate to login page
    this.router.navigate(['/auth-screen']);
  }

  // Refresh the token (if your API supports it)
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh-token`, {})
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setSession(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Get user profile info
  getUserProfile(): Observable<User> {
    return this.http.get<{ success: boolean; data: User }>(`${this.apiUrl}/auth/profile`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Update user profile
  updateUserProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<{ success: boolean; data: User }>(`${this.apiUrl}/auth/profile`, userData)
      .pipe(
        map(response => {
          if (response.success) {
            // Update stored user data
            const currentUser = this.currentUserSubject.value;
            if (currentUser) {
              const updatedUser = { ...currentUser, ...response.data };
              localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
              this.currentUserSubject.next(updatedUser);
            }
            return response.data;
          }
          throw new Error('Failed to update profile');
        }),
        catchError(this.handleError)
      );
  }

  // Request password reset
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/forgot-password`, { email })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Reset password with token
  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/reset-password`, { token, password })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Check if user has a specific role
  hasRole(role: 'jobseeker' | 'employer' | 'admin'): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && user.role === role;
  }

  // Navigate based on user role
  navigateToDashboard(): void {
    const user = this.currentUserSubject.value;
    if (!user) {
      this.router.navigate(['/auth-screen']);
      return;
    }

    switch (user.role) {
      case 'jobseeker':
        this.router.navigate(['/jobseeker/dashboard']);
        break;
      case 'employer':
        this.router.navigate(['/employer/dashboard']);
        break;
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/auth-screen']);
    }
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
      
      // Handle specific status codes
      if (error.status === 401) {
        // Unauthorized - clear user session
        this.logout();
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
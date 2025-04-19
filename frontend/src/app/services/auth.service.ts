// src/app/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
  role: 'jobseeker' | 'employer' | 'admin';
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'jobseeker' | 'employer' | 'admin';
  firstName: string;
  lastName: string;
  companyName?: string;
  profilePhoto?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  role: 'jobseeker' | 'employer' | 'admin';
  firstName: string;
  lastName: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
  profilePhoto?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.logout();
      }
    }
  }

  // Core authentication methods
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap(response => this.handleAuthentication(response))
      );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthentication(response))
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // User state management
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    return this.currentUserValue?.role || null;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Private helper methods
  private handleAuthentication(response: AuthResponse): void {
    const { token, user } = response;
    
    // Store token and user in localStorage
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    // Update observables
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    
    // Redirect based on role
    this.redirectAfterLogin(user.role);
  }

  private redirectAfterLogin(role: string): void {
    const routes = {
      jobseeker: '/jobseeker/dashboard',
      employer: '/employer/dashboard',
      admin: '/admin/dashboard'
    };
    this.router.navigate([routes[role as keyof typeof routes] || '/']);
  }

  // Additional authentication methods
  checkAuthStatus(): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    }).pipe(
      tap(isValid => {
        if (!isValid) this.logout();
        this.isAuthenticatedSubject.next(isValid);
      })
    );
  }

  updateUserProfile(updates: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/me`, updates).pipe(
      tap(updatedUser => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      })
    );
  }

  // Password recovery methods
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.API_URL}/auth/forgot-password`, 
      { email }
    );
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.API_URL}/auth/reset-password`,
      { token, password: newPassword }
    );
  }

  // Social login methods
  loginWithGoogle(role: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/google`, { role })
      .pipe(
        tap(response => this.handleAuthentication(response))
      );
  }

  loginWithLinkedIn(role: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/linkedin`, { role })
      .pipe(
        tap(response => this.handleAuthentication(response))
      );
  }
}
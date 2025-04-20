// src/app/services/auth.service.ts
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { tap, catchError, retry } from 'rxjs/operators';
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
  private readonly TOKEN_KEY = 'your_secret_key_here';
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
    console.log('Registration service called with data:', userData);
    
    // Set headers to ensure proper content type
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData, { headers })
      .pipe(
        tap(response => {
          console.log('Registration successful:', response);
          // We'll handle authentication in the component to better control the flow
        }),
        catchError(this.handleError)
      );
  }

  // Add this method to your AuthService
getCurrentUserProfile(): Observable<User> {
  // If we already have the user data stored locally, return it
  const currentUser = this.currentUserValue;
  if (currentUser) {
    return of(currentUser);
  }
  
  // Otherwise, fetch it from the server
  return this.http.get<User>(`${this.API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${this.getToken()}`
    }
  }).pipe(
    tap(user => {
      // Update the stored user
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
    }),
    catchError(this.handleError)
  );
}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('Login service called with:', credentials);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials, { headers })
      .pipe(
        tap(response => {
          console.log('Login successful:', response);
          this.handleAuthentication(response);
        }),
        catchError(this.handleError)
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

  // Error handling
  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
      console.error('Client error:', errorMessage);
    } else {
      // Server-side error
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`
      );
      
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }
    
    // Return an observable with a user-facing error message
    return throwError(() => error);
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
      }),
      catchError(error => {
        this.logout();
        return of(false);
      })
    );
  }

  updateUserProfile(updates: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/me`, updates, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    }).pipe(
      tap(updatedUser => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      }),
      catchError(this.handleError)
    );
  }

  // Password recovery methods
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.API_URL}/auth/forgot-password`, 
      { email }
    ).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.API_URL}/auth/reset-password`,
      { token, password: newPassword }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Social login methods
  loginWithGoogle(role: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/google/login`, { role })
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(this.handleError)
      );
  }

  loginWithLinkedIn(role: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/linkedin/login`, { role })
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(this.handleError)
      );
  }

  // Social signup methods
  signupWithGoogle(role: string, additionalInfo: any = {}): Observable<AuthResponse> {
    const payload = { role, ...additionalInfo };
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/google/signup`, payload)
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(this.handleError)
      );
  }

  signupWithLinkedIn(role: string, additionalInfo: any = {}): Observable<AuthResponse> {
    const payload = { role, ...additionalInfo };
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/linkedin/signup`, payload)
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(this.handleError)
      );
  }
}
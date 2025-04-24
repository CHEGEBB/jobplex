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
  private readonly TOKEN_KEY = 'jobplex_auth_token';
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
    if (this.getToken()) {
      this.checkAuthStatus().subscribe();
    }
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
          
          // Modified check for admin users
          if (response.user.role !== credentials.role) {
            // If attempting to login as admin but account is not admin
            if (credentials.role === 'admin' && response.user.role !== 'admin') {
              this.logout();
              throw new Error(`Access denied. Only admin accounts can log in as admin.`);
            }
            // If attempting to login as non-admin with admin account
            else if (credentials.role !== 'admin' && response.user.role === 'admin') {
              // Allow admin to login as other roles if needed
              console.log('Admin logging in with a different role');
            }
            // For non-admin users trying to use a different role
            else {
              this.logout();
              throw new Error(`Access denied. You cannot log in as ${credentials.role} with a ${response.user.role} account.`);
            }
          }
          
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

  // Check if user has proper role to access a specific route
  hasRoleAccess(requiredRole: string): boolean {
    const userRole = this.getUserRole();
    return userRole === requiredRole || userRole === 'admin'; // Admin can access all routes
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
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized: Your session may have expired. Please log in again.';
        this.logout(); // Logout on 401 errors
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }
    
    // Return an observable with the user-facing error message
    return throwError(() => new Error(errorMessage));
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
    // Ensure the role is valid before redirecting
    const targetRoute = routes[role as keyof typeof routes];
    if (targetRoute) {
      this.router.navigate([targetRoute]);
    } else {
      // If role is not valid, log out and redirect to login
      console.error('Invalid role detected:', role);
      this.logout();
    }
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

  // Route guard method to protect routes by role
  canAccessRoute(requiredRole: 'jobseeker' | 'employer' | 'admin'): boolean {
    const currentUser = this.currentUserValue;
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }
    
    // Check if user has the required role
    if (currentUser.role !== requiredRole && currentUser.role !== 'admin') {
      this.router.navigate([`/${currentUser.role}/dashboard`]);
      return false;
    }
    
    return true;
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
        tap(response => {
          // Verify that user can only log in with their actual role
          if (response.user.role !== role) {
            throw new Error(`Access denied. You cannot log in as ${role} with a ${response.user.role} account.`);
          }
          this.handleAuthentication(response);
        }),
        catchError(this.handleError)
      );
  }

  loginWithLinkedIn(role: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/linkedin/login`, { role })
      .pipe(
        tap(response => {
          // Verify that user can only log in with their actual role
          if (response.user.role !== role) {
            throw new Error(`Access denied. You cannot log in as ${role} with a ${response.user.role} account.`);
          }
          this.handleAuthentication(response);
        }),
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
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
  private readonly API_URL = 'http://18.208.134.30/api/auth';
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user_data';
  private readonly USER_ID_KEY = 'userId'; // Added for consistency
  
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
    
    console.log('AuthService initialized');
    console.log('Token exists:', !!this.getToken());
    console.log('User data exists:', !!userData);
    console.log('UserId exists:', !!localStorage.getItem(this.USER_ID_KEY));
  }

  // Register a new user
  register(signupData: SignupData): Observable<AuthResponse> {
    console.log('Registering new user:', { ...signupData, password: '[REDACTED]' });
    const payload = {
      ...signupData,
      // Add company field for employer role
      ...(signupData.role === 'employer' && signupData.companyName 
          ? { company: signupData.companyName } 
          : {})
    };
    
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, payload).pipe(
      tap(response => console.log('Registration response:', { 
        ...response, 
        data: response.data ? { 
          ...response.data, 
          token: response.data.token ? '[TOKEN EXISTS]' : '[NO TOKEN]',
          user: response.data.user ? { ...response.data.user, password: undefined } : undefined
        } : undefined 
      })),
      catchError(error => {
        console.error('Registration error', error);
        console.error('Error details:', error.error || error.message);
        return throwError(() => new Error(error.error?.message || 'Registration failed'));
      })
    );
  }

  // Login user
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    console.log('Logging in user:', { email: credentials.email, password: '[REDACTED]' });
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        console.log('Login response:', { 
          success: response.success, 
          hasToken: !!response.data?.token,
          hasUser: !!response.data?.user
        });
        
        if (response.success && response.data.token) {
          this.setAuthData(response.data.token, response.data.user);
        }
      }),
      catchError(error => {
        console.error('Login error', error);
        console.error('Error details:', error.error || error.message);
        return throwError(() => new Error(error.error?.message || 'Login failed'));
      })
    );
  }

  // Google OAuth login
  loginWithGoogle(role: 'jobseeker' | 'employer' | 'admin'): Observable<AuthResponse> {
    console.log('Logging in with Google for role:', role);
    // This would typically redirect to Google OAuth flow
    // For now we'll simulate with a direct API call
    return this.http.post<AuthResponse>(`${this.API_URL}/google-auth`, { role }).pipe(
      tap(response => {
        console.log('Google login response:', { 
          success: response.success, 
          hasToken: !!response.data?.token,
          hasUser: !!response.data?.user
        });
        
        if (response.success && response.data.token) {
          this.setAuthData(response.data.token, response.data.user);
        }
      }),
      catchError(error => {
        console.error('Google login error', error);
        console.error('Error details:', error.error || error.message);
        return throwError(() => new Error(error.error?.message || 'Google login failed'));
      })
    );
  }

  // LinkedIn OAuth login
  loginWithLinkedIn(role: 'jobseeker' | 'employer' | 'admin'): Observable<AuthResponse> {
    console.log('Logging in with LinkedIn for role:', role);
    // This would typically redirect to LinkedIn OAuth flow
    // For now we'll simulate with a direct API call
    return this.http.post<AuthResponse>(`${this.API_URL}/linkedin-auth`, { role }).pipe(
      tap(response => {
        console.log('LinkedIn login response:', { 
          success: response.success, 
          hasToken: !!response.data?.token,
          hasUser: !!response.data?.user
        });
        
        if (response.success && response.data.token) {
          this.setAuthData(response.data.token, response.data.user);
        }
      }),
      catchError(error => {
        console.error('LinkedIn login error', error);
        console.error('Error details:', error.error || error.message);
        return throwError(() => new Error(error.error?.message || 'LinkedIn login failed'));
      })
    );
  }

  // Logout user
  logout(): void {
    console.log('Logging out user');
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    console.log('User logged out, auth state cleared');
  }

  // Request password reset
  requestPasswordReset(email: string): Observable<any> {
    console.log('Requesting password reset for:', email);
    return this.http.post<any>(`${this.API_URL}/forgot-password`, { email }).pipe(
      tap(response => console.log('Password reset request response:', response)),
      catchError(error => {
        console.error('Password reset request error', error);
        console.error('Error details:', error.error || error.message);
        return throwError(() => new Error(error.error?.message || 'Password reset request failed'));
      })
    );
  }

  // Reset password with token
  resetPassword(token: string, newPassword: string): Observable<any> {
    console.log('Resetting password with token');
    return this.http.post<any>(`${this.API_URL}/reset-password`, { 
      token, 
      password: newPassword 
    }).pipe(
      tap(response => console.log('Password reset response:', response)),
      catchError(error => {
        console.error('Password reset error', error);
        console.error('Error details:', error.error || error.message);
        return throwError(() => new Error(error.error?.message || 'Password reset failed'));
      })
    );
  }

  // Get current user
  getCurrentUser(): User | null {
    const user = this.currentUserSubject.value;
    console.log('Getting current user:', user ? `ID: ${user.id}, Role: ${user.role}` : 'No user');
    return user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const hasToken = !!this.getToken();
    console.log('Checking if user is authenticated:', hasToken);
    return hasToken;
  }

  // Get JWT token
  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token;
  }

  // Get user role
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    const role = user ? user.role : null;
    console.log('Getting user role:', role);
    return role;
  }

  // Get user ID directly (added for convenience)
  getUserId(): string | null {
    const user = this.getCurrentUser();
    const userId = user ? user.id.toString() : localStorage.getItem(this.USER_ID_KEY);
    console.log('Getting user ID:', userId);
    return userId;
  }

  // Store auth data in localStorage
  private setAuthData(token: string, user: User): void {
    console.log('Setting auth data:', { 
      userId: user.id, 
      role: user.role,
      tokenLength: token.length
    });
    
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.USER_ID_KEY, user.id.toString());
    
    this.currentUserSubject.next(user);
  this.isAuthenticatedSubject.next(true);
    
    console.log('Auth data stored successfully');
  }
}
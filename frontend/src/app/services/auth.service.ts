import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
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

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
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
        const user = JSON.parse(userJson) as User;
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.logout();
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public get user(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  public getUserRole(): string | null {
    const user = this.currentUserValue;
    return user ? user.role : null;
  }

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

  forgotPassword(data: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/auth/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/auth/reset-password`, data);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/me`, userData)
      .pipe(
        tap(user => {
          const currentUser = this.currentUserValue;
          if (currentUser) {
            const updatedUser = { ...currentUser, ...user };
            localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
            this.currentUserSubject.next(updatedUser);
          }
        })
      );
  }

  updateProfilePhoto(photoUrl: string): Observable<User> {
    const currentUser = this.currentUserValue;
    if (!currentUser) {
      return of(null as unknown as User);
    }
    
    const updatedUser = { ...currentUser, profilePhoto: photoUrl };
    return this.http.put<User>(`${this.API_URL}/users/me/photo`, { photoUrl })
      .pipe(
        tap(() => {
          localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        })
      );
  }

  isLoggedIn(): boolean {
    return !!this.token && !!this.currentUserValue;
  }

  checkAuthStatus(): Observable<boolean> {
    if (this.isLoggedIn()) {
      return this.http.get<boolean>(`${this.API_URL}/auth/verify`)
        .pipe(
          tap(isValid => {
            if (!isValid) {
              this.logout();
            }
          })
        );
    }
    return of(false);
  }

  private handleAuthentication(response: AuthResponse): void {
    const { token, user } = response;
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }
}
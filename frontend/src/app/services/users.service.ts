import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'jobseeker' | 'employer' | 'admin';
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  isVerified?: boolean;
  lastActive?: string;
  passwordLastChanged?: string;
  twoFactorEnabled?: boolean;
  profile?: any;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    totalUsers: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get all users with pagination and filtering
  getAllUsers(
    page: number = 1, 
    limit: number = 10, 
    role?: string, 
    search?: string
  ): Observable<UserListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (role && role !== 'all') {
      params = params.set('role', role);
    }
    
    if (search && search.trim() !== '') {
      params = params.set('search', search);
    }
    
    const url = `${this.API_URL}/users`;
    console.log('Calling API URL:', url);
    console.log('With params:', params.toString());
    console.log('Auth token:', this.authService.getToken() ? 'Present' : 'Missing');
    
    return this.http.get<UserListResponse>(url, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      },
      params
    }).pipe(
      tap(response => {
        console.log('Raw users response:', response);
        if (response.users) {
          console.log('Number of users received:', response.users.length);
        } else {
          console.error('No users array in response!');
        }
      }),
      catchError(this.handleError)
    );
  }

  // Get user by ID
  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    }).pipe(
      tap(user => console.log('User fetched:', user)),
      catchError(this.handleError)
    );
  }

  // Create a new user
  createUser(userData: any): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/auth/register`, userData, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    }).pipe(
      tap(user => console.log('User created:', user)),
      catchError(this.handleError)
    );
  }

  // Update user by ID
  updateUser(userId: string, userData: any): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    }).pipe(
      tap(user => console.log('User updated:', user)),
      catchError(this.handleError)
    );
  }

  // Delete user by ID
  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    }).pipe(
      tap(response => console.log('User deleted:', response)),
      catchError(this.handleError)
    );
  }

  // Change user role
  changeUserRole(userId: string, role: string): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/users/${userId}/role`, { role }, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    }).pipe(
      tap(response => console.log('User role changed:', response)),
      catchError(this.handleError)
    );
  }

  // Ban or unban a user
  toggleUserBan(userId: string, banned: boolean, reason?: string): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/users/${userId}/ban`, { banned, reason }, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    }).pipe(
      tap(response => console.log('User ban status toggled:', response)),
      catchError(this.handleError)
    );
  }

  // Get user activity logs (function stub - implement if endpoint is available)
  getUserActivityLogs(userId: string): Observable<any[]> {
    // If your backend supports this endpoint
    return this.http.get<any[]>(`${this.API_URL}/users/${userId}/activity`, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    }).pipe(
      tap(logs => console.log('User activity logs fetched:', logs)),
      catchError(this.handleError)
    );
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
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }
    
    // Return an observable with the user-facing error message
    return throwError(() => new Error(errorMessage));
  }
}
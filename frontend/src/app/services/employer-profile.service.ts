import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmployerProfileService {
  private apiUrl = 'http://18.208.134.30/api/employer/profile';

  constructor(private http: HttpClient) { }

  // Get the employer profile for the authenticated user
  getProfile(): Observable<any> {
    return this.http.get<any>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Create a new employer profile
  createProfile(profileData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, profileData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update an existing employer profile
  updateProfile(profileData: any): Observable<any> {
    return this.http.put<any>(this.apiUrl, profileData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Delete the employer profile
  deleteProfile(): Observable<any> {
    return this.http.delete<any>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}, Message: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
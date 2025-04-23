// src/app/services/ai.service.ts
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

// Career Path Interfaces
export interface LearningResource {
  name: string;
  type: string;
  description: string;
}

export interface CareerPath {
  title: string;
  description: string;
  matchPercentage: number;
  skillGaps: string[];
  learningResources: LearningResource[];
}

export interface CareerPathResponse {
  careerPaths: CareerPath[];
  analysis: string;
}

// Saved Career Path Interfaces
export interface SavedCareerPath {
  id: number;
  analysis: string;
  created_at: string;
  career_paths: CareerPath[];
}

// Candidate Matching Interfaces
export interface CandidateMatch {
  id: number;
  name: string;
  matchPercentage: number;
  matchReason: string;
  missingSkills: string[];
}

export interface CandidateMatchResponse {
  candidates: CandidateMatch[];
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly API_URL = `${environment.apiUrl}/ai`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Get AI-generated career path recommendations based on user's profile and skills
   */
  getCareerPathRecommendations(): Observable<CareerPathResponse> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<CareerPathResponse>(`${this.API_URL}/career-path`, { headers })
      .pipe(
        tap(response => console.log('Received career path recommendations:', response)),
        catchError(this.handleError)
      );
  }

  /**
   * Get all saved career paths for the current user
   */
  getSavedCareerPaths(): Observable<SavedCareerPath[]> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<SavedCareerPath[]>(`${this.API_URL}/career-paths`, { headers })
      .pipe(
        tap(paths => console.log(`Retrieved ${paths.length} saved career paths`)),
        catchError(this.handleError)
      );
  }

  /**
   * Delete a specific career path
   * @param careerPathId The ID of the career path to delete
   */
  deleteCareerPath(careerPathId: number): Observable<{ message: string }> {
    const headers = this.getAuthHeaders();
    
    return this.http.delete<{ message: string }>(`${this.API_URL}/career-path/${careerPathId}`, { headers })
      .pipe(
        tap(response => console.log(`Career path deleted: ${response.message}`)),
        catchError(this.handleError)
      );
  }

  /**
   * Match candidates to a specific job posting (for employers)
   * @param jobId The ID of the job posting to match candidates for
   */
  matchCandidates(jobId: number): Observable<CandidateMatchResponse> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<CandidateMatchResponse>(`${this.API_URL}/match-candidates/${jobId}`, { headers })
      .pipe(
        tap(response => console.log(`Matched ${response.candidates.length} candidates for job ${jobId}`)),
        catchError(this.handleError)
      );
  }

  /**
   * Get authentication headers with the token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Error handling for HTTP requests
   */
  private handleError(error: HttpErrorResponse) {
    console.error('AI Service Error:', error);
    
    let errorMessage = 'An error occurred with the AI service';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
        this.authService.logout(); // Important: logout on 401 unauthorized
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `AI Service error: ${error.status}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
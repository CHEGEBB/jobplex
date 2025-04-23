// ai.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

// Define interfaces for type safety
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

export interface CandidateMatch {
  id: string | number;
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
  private apiUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  /**
   * For Job Seekers: Get AI-recommended career paths based on user skills
   */
  getCareerPathRecommendations(): Observable<CareerPathResponse> {
    return this.http.get<CareerPathResponse>(`${this.apiUrl}/career-path`);
  }

  /**
   * For Employers: Match candidates to a job posting based on skills
   * @param jobId - The ID of the job to match candidates for
   */
  matchCandidatesForJob(jobId: number): Observable<CandidateMatchResponse> {
    return this.http.get<CandidateMatchResponse>(`${this.apiUrl}/match-candidates/${jobId}`);
  }
}
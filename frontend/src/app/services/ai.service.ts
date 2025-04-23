import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

// Define interfaces for the responses
export interface CareerPathRecommendation {
  title: string;
  description: string;
  matchPercentage: number;
  skillGaps: string[];
  learningResources: string[];
}

export interface CareerPathResponse {
  recommendations: CareerPathRecommendation[];
}

export interface CandidateMatch {
  userId: number;
  firstName: string;
  lastName: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface CandidateMatchResponse {
  jobTitle: string;
  candidates: CandidateMatch[];
}

export interface JobDescription {
  about: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

export interface JobDescriptionResponse {
  jobDescription: JobDescription;
}

export interface ResumeAnalysis {
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    responsibilities: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  suggestions: string[];
}

export interface ResumeAnalysisResponse {
  resumeAnalysis: ResumeAnalysis;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) { }

  /**
   * Job Seeker Services
   */

  // Get career path recommendations
  getCareerPathRecommendations(): Observable<CareerPathResponse> {
    return this.http.get<CareerPathResponse>(`${this.apiUrl}/career-path`);
  }

  // Analyze resume text
  analyzeResume(resumeText: string): Observable<ResumeAnalysisResponse> {
    return this.http.post<ResumeAnalysisResponse>(`${this.apiUrl}/analyze-resume`, { resumeText });
  }

  /**
   * Employer Services
   */

  // Match candidates to a job posting
  matchCandidatesToJob(jobId: number): Observable<CandidateMatchResponse> {
    return this.http.get<CandidateMatchResponse>(`${this.apiUrl}/match-candidates/${jobId}`);
  }

  // Generate job description
  generateJobDescription(jobInfo: {
    title: string;
    companyName: string;
    location?: string;
    requiredSkills: string[];
    jobType?: string;
    experienceLevel?: string;
  }): Observable<JobDescriptionResponse> {
    return this.http.post<JobDescriptionResponse>(
      `${this.apiUrl}/generate-job-description`, 
      jobInfo
    );
  }
}
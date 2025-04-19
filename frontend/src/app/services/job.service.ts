import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Job {
  id: number;
  employerId: number;
  title: string;
  description: string;
  location: string;
  salaryRange: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  createdAt: string;
  updatedAt: string;
  skills?: JobSkill[];
}

export interface JobSkill {
  id: number;
  jobId: number;
  skillName: string;
  importance: 'required' | 'preferred' | 'nice-to-have';
  createdAt: string;
}

export interface JobFilters {
  title?: string;
  location?: string;
  jobType?: string;
  skillNames?: string[];
  page?: number;
  limit?: number;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  location: string;
  salaryRange: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  skills: {
    skillName: string;
    importance: 'required' | 'preferred' | 'nice-to-have';
  }[];
}

export interface JobApplication {
  id: number;
  jobId: number;
  userId: number;
  status: 'pending' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllJobs(filters?: JobFilters): Observable<Job[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.title) params = params.append('title', filters.title);
      if (filters.location) params = params.append('location', filters.location);
      if (filters.jobType) params = params.append('jobType', filters.jobType);
      if (filters.page) params = params.append('page', filters.page.toString());
      if (filters.limit) params = params.append('limit', filters.limit.toString());
      
      if (filters.skillNames && filters.skillNames.length > 0) {
        filters.skillNames.forEach(skill => {
          params = params.append('skills', skill);
        });
      }
    }
    
    return this.http.get<Job[]>(`${this.API_URL}/jobs`, { params });
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.API_URL}/jobs/${id}`);
  }

  createJob(job: CreateJobRequest): Observable<Job> {
    return this.http.post<Job>(`${this.API_URL}/jobs`, job);
  }

  updateJob(id: number, job: Partial<CreateJobRequest>): Observable<Job> {
    return this.http.put<Job>(`${this.API_URL}/jobs/${id}`, job);
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/jobs/${id}`);
  }

  applyForJob(jobId: number): Observable<JobApplication> {
    return this.http.post<JobApplication>(`${this.API_URL}/jobs/${jobId}/apply`, {});
  }

  getJobMatches(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.API_URL}/jobs/matches`);
  }

  getMyJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.API_URL}/jobs/my-jobs`);
  }

  getMyApplications(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${this.API_URL}/jobs/my-applications`);
  }

  getJobApplications(jobId: number): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${this.API_URL}/jobs/${jobId}/applications`);
  }

  updateApplicationStatus(applicationId: number, status: JobApplication['status']): Observable<JobApplication> {
    return this.http.put<JobApplication>(`${this.API_URL}/jobs/applications/${applicationId}`, { status });
  }
}
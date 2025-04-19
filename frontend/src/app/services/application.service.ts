import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Application {
  id: number;
  jobId: number;
  userId: number;
  status: 'pending' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  job?: {
    id: number;
    title: string;
    company?: string;
    location?: string;
  };
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ApplicationStatusUpdate {
  status: 'pending' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected';
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // For job seekers to view their applications
  getMyApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.API_URL}/applications/my-applications`);
  }

  // For employers to view applications for a specific job
  getApplicationsForJob(jobId: number): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.API_URL}/applications/job/${jobId}`);
  }

  // Get application details
  getApplicationById(id: number): Observable<Application> {
    return this.http.get<Application>(`${this.API_URL}/applications/${id}`);
  }

  // Apply for a job
  applyForJob(jobId: number): Observable<Application> {
    return this.http.post<Application>(`${this.API_URL}/applications`, { jobId });
  }

  // Update application status (for employers)
  updateApplicationStatus(id: number, statusUpdate: ApplicationStatusUpdate): Observable<Application> {
    return this.http.put<Application>(`${this.API_URL}/applications/${id}/status`, statusUpdate);
  }

  // Withdraw application (for job seekers)
  withdrawApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/applications/${id}`);
  }

  // For employers to see all applications
  getAllApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.API_URL}/applications`);
  }

  // Get application statistics for employers
  getApplicationStatistics(jobId?: number): Observable<any> {
    let url = `${this.API_URL}/applications/statistics`;
    if (jobId) {
      url += `?jobId=${jobId}`;
    }
    return this.http.get<any>(url);
  }
}
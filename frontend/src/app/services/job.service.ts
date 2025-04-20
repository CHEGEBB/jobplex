// src/app/services/job.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';


export interface JobSkill {
  skillName: string;
  importance: 'required' | 'preferred' | 'nice-to-have';
}

export interface JobStats {
  active: number;
  applications: number;
  matched: number;
  interviews: number;
}

export interface Job {
  id: number;
  title: string;
  company?: string;
  location: string;
  salary?: string;
  type: string;
  status: 'active' | 'draft' | 'closed' | 'archived';
  description: string;
  requirements?: string;
  benefits?: string;
  postDate: string;
  deadlineDate?: string;
  department?: string;
  workMode?: string;
  experienceLevel?: string;
  educationLevel?: string;
  skills: string[] | JobSkill[];
  screeningQuestions?: any[];
  views?: number;
  applications?: number;
  matches?: number;
  salaryVisible?: boolean;
  minSalary?: number;
  maxSalary?: number;
  internal?: boolean;
  careerSite?: boolean;
  linkedin?: boolean;
  indeed?: boolean;
  teamAccess?: string;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  location?: string;
  salaryRange?: string;
  jobType: string;
  status?: string;
  department?: string;
  workMode?: string;
  experienceLevel?: string;
  educationLevel?: string;
  requirements?: string;
  benefits?: string;
  deadlineDate?: string;
  minSalary?: number;
  maxSalary?: number;
  salaryVisible?: boolean;
  skills?: JobSkill[];
  screeningQuestions?: any[];
  internal?: boolean;
  careerSite?: boolean;
  linkedin?: boolean;
  indeed?: boolean;
  teamAccess?: string;
  scheduledDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = `${environment.apiUrl}/jobs`;
  private jobStatsSubject = new BehaviorSubject<JobStats>({
    active: 0,
    applications: 0,
    matched: 0,
    interviews: 0
  });
  
  jobStats$ = this.jobStatsSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.refreshJobStats();
  }

  // Helper method to get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get all jobs with optional filters
  getJobs(filters?: any): Observable<{ jobs: Job[], pagination: any }> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.title) params = params.set('title', filters.title);
      if (filters.location) params = params.set('location', filters.location);
      if (filters.jobType) params = params.set('jobType', filters.jobType);
      if (filters.skill) params = params.set('skill', filters.skill);
      if (filters.page) params = params.set('page', filters.page);
      if (filters.limit) params = params.set('limit', filters.limit);
    }
    
    return this.http.get<{ jobs: any[], pagination: any }>(this.apiUrl, { 
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const formattedJobs = response.jobs.map(job => this.formatJobForFrontend(job));
        return {
          jobs: formattedJobs,
          pagination: response.pagination
        };
      }),
      catchError(this.handleError<{ jobs: Job[], pagination: any }>('getJobs', { jobs: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } }))
    );
  }

  // Get employer's own jobs
  getEmployerJobs(): Observable<Job[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employer/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(jobs => jobs.map(job => this.formatJobForFrontend(job))),
      tap(jobs => {
        const active = jobs.filter(job => job.status === 'active').length;
        let applications = 0;
        let matches = 0;
        
        jobs.forEach(job => {
          applications += job.applications || 0;
          matches += job.matches || 0;
        });
        
        this.jobStatsSubject.next({
          active,
          applications,
          matched: matches,
          interviews: 0 // This would be fetched from a real API
        });
      }),
      catchError(this.handleError<Job[]>('getEmployerJobs', []))
    );
  }

  // Get job by ID
  getJobById(id: number): Observable<Job> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(job => this.formatJobForFrontend(job)),
      catchError(this.handleError<Job>('getJobById'))
    );
  }

  // Create new job
  createJob(jobData: CreateJobRequest): Observable<Job> {
    const formattedJob = this.formatJobForBackend(jobData);
    return this.http.post<any>(this.apiUrl, formattedJob, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(job => this.formatJobForFrontend(job)),
      tap(() => this.refreshJobStats()),
      catchError(this.handleError<Job>('createJob'))
    );
  }

  // Update job
  updateJob(id: number, jobData: Partial<CreateJobRequest>): Observable<Job> {
    const formattedJob = this.formatJobForBackend(jobData);
    return this.http.put<any>(`${this.apiUrl}/${id}`, formattedJob, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(job => this.formatJobForFrontend(job)),
      tap(() => this.refreshJobStats()),
      catchError(this.handleError<Job>('updateJob'))
    );
  }

  // Delete job
  deleteJob(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => this.refreshJobStats()),
      catchError(this.handleError('deleteJob'))
    );
  }

  // Update job status (active/closed/archived)
  updateJobStatus(id: number, status: string): Observable<Job> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status }, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(job => this.formatJobForFrontend(job)),
      tap(() => this.refreshJobStats()),
      catchError(this.handleError<Job>('updateJobStatus'))
    );
  }

  // Get job matches (for job seekers)
  getJobMatches(): Observable<{ matches: Job[], userSkills: string[], totalMatches: number }> {
    return this.http.get<any>(`${this.apiUrl}/matches/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => ({
        matches: response.matches.map((job: any) => this.formatJobForFrontend(job)),
        userSkills: response.userSkills,
        totalMatches: response.totalMatches
      })),
      catchError(this.handleError<{ matches: Job[], userSkills: string[], totalMatches: number }>('getJobMatches', { matches: [], userSkills: [], totalMatches: 0 }))
    );
  }

  // Apply for a job (for job seekers)
  applyForJob(jobId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${jobId}/apply`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError('applyForJob'))
    );
  }

  // Refresh job statistics
  refreshJobStats(): void {
    this.getEmployerJobs().subscribe();
  }

  // Format job data from backend to frontend format
  private formatJobForFrontend(job: any): Job {
    // Convert skills from backend format to frontend format
    let skills: string[] = [];
    if (job.skills && Array.isArray(job.skills)) {
      // If skills is an array of objects with skillName property, extract just the names
      skills = job.skills.map((s: any) => typeof s === 'object' && s.skillName ? s.skillName : s);
    }

    // Format salary range if minSalary and maxSalary are available
    let salary = job.salary_range || '';
    if (job.min_salary && job.max_salary) {
      salary = `$${job.min_salary.toLocaleString()} - $${job.max_salary.toLocaleString()}`;
    }

    // Convert job_type to type, etc.
    return {
      id: job.id,
      title: job.title,
      company: job.company_name,
      location: job.location || 'Remote',
      salary: salary,
      type: job.job_type || 'Full-time',
      status: job.status || 'active',
      description: job.description || '',
      requirements: job.requirements || '',
      benefits: job.benefits || '',
      postDate: job.created_at ? new Date(job.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      deadlineDate: job.deadline_date,
      department: job.department || '',
      workMode: job.work_mode || 'On-site',
      experienceLevel: job.experience_level || 'Mid-level',
      educationLevel: job.education_level || '',
      skills: skills,
      screeningQuestions: job.screening_questions || [],
      views: job.views || 0,
      applications: job.applications_count || 0,
      matches: job.matches_count || 0,
      salaryVisible: job.salary_visible !== undefined ? job.salary_visible : true,
      minSalary: job.min_salary,
      maxSalary: job.max_salary,
      internal: job.internal !== undefined ? job.internal : true,
      careerSite: job.career_site !== undefined ? job.career_site : true,
      linkedin: job.linkedin || false,
      indeed: job.indeed || false,
      teamAccess: job.team_access || 'all'
    };
  }

  // Format job data from frontend to backend format
  private formatJobForBackend(job: Partial<CreateJobRequest>): any {
    // Format skills for backend
    const formattedSkills = job.skills?.map(skill => {
      if (typeof skill === 'string') {
        return {
          skillName: skill,
          importance: 'required' // Default to required
        };
      }
      return skill;
    });

    // Format salary range
    let salaryRange = '';
    if (job.minSalary && job.maxSalary) {
      salaryRange = `$${job.minSalary} - $${job.maxSalary}`;
    }

    return {
      title: job.title,
      description: job.description,
      location: job.location,
      salary_range: salaryRange,
      job_type: job.jobType?.toLowerCase(),
      status: job.status,
      department: job.department,
      work_mode: job.workMode,
      experience_level: job.experienceLevel,
      education_level: job.educationLevel,
      requirements: job.requirements,
      benefits: job.benefits,
      deadline_date: job.deadlineDate,
      min_salary: job.minSalary,
      max_salary: job.maxSalary,
      salary_visible: job.salaryVisible,
      skills: formattedSkills,
      screening_questions: job.screeningQuestions,
      internal: job.internal,
      career_site: job.careerSite,
      linkedin: job.linkedin,
      indeed: job.indeed,
      team_access: job.teamAccess,
      scheduled_date: job.scheduledDate
    };
  }

  // Error handling
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      
      // Return empty result to keep app running
      return of(result as T);
    };
  }
}
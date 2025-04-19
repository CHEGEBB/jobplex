// src/app/services/portfolio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

// Types
export interface Skill {
  id: number;
  user_id: number;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSkillRequest {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience: number;
}

export interface Project {
  id: number;
  user_id: number;
  title: string;
  description: string;
  skills: string[];
  github?: string;
  link?: string;
  image: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  skills: string[];
  github?: string;
  link?: string;
  image?: string;
  featured: boolean;
}

export interface Certificate {
  id: number;
  user_id: number;
  name: string;
  issuer: string;
  date: string;
  expiry?: string;
  credential_id?: string;
  link?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCertificateRequest {
  name: string;
  issuer: string;
  date: string;
  expiry?: string;
  credential_id?: string;
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = `${environment.apiUrl}/portfolio`;
  
  // BehaviorSubjects for reactive data
  private skillsSubject = new BehaviorSubject<Skill[]>([]);
  skills$ = this.skillsSubject.asObservable();
  
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  projects$ = this.projectsSubject.asObservable();
  
  private certificatesSubject = new BehaviorSubject<Certificate[]>([]);
  certificates$ = this.certificatesSubject.asObservable();
  
  constructor(private http: HttpClient, private authService: AuthService) {}
  
  // Helper method to get HTTP options with auth token
  private getHttpOptions() {
    const token = this.authService.getToken();
    console.log('Getting HTTP options, token exists:', !!token);
    
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }
  
  // SKILLS METHODS
  
  getMySkills(): Observable<Skill[]> {
    console.log('Fetching skills from API');
    const token = this.authService.getToken();
    console.log('Before skill fetch, token:', token ? 'Token exists' : 'No token');
    
    return this.http.get<Skill[]>(`${this.apiUrl}/skills`, this.getHttpOptions())
      .pipe(
        tap(skills => {
          console.log('Skills fetched successfully:', skills);
          this.skillsSubject.next(skills);
        }),
        catchError(error => {
          console.error('Error fetching skills:', error);
          return throwError(() => new Error('Failed to fetch skills: ' + (error.message || 'Server error')));
        })
      );
  }
  
  createSkill(skill: CreateSkillRequest): Observable<Skill> {
    console.log('Creating skill:', skill);
    const token = this.authService.getToken();
    const userRole = this.authService.getUserRole();
    console.log('Before skill creation, token:', token ? 'Token exists' : 'No token');
    console.log('Before skill creation, user role:', userRole);
    
    return this.http.post<Skill>(`${this.apiUrl}/skills`, skill, this.getHttpOptions())
      .pipe(
        tap(newSkill => {
          console.log('Skill created successfully:', newSkill);
          const currentSkills = this.skillsSubject.value;
          this.skillsSubject.next([...currentSkills, newSkill]);
        }),
        catchError(error => {
          console.error('Error creating skill:', error);
          return throwError(() => new Error('Failed to create skill: ' + (error.message || 'Server error')));
        })
      );
  }
  
  updateSkill(id: number, skill: CreateSkillRequest): Observable<Skill> {
    return this.http.put<Skill>(`${this.apiUrl}/skills/${id}`, skill, this.getHttpOptions())
      .pipe(
        tap(updatedSkill => {
          const currentSkills = this.skillsSubject.value;
          const index = currentSkills.findIndex(s => s.id === id);
          if (index !== -1) {
            currentSkills[index] = updatedSkill;
            this.skillsSubject.next([...currentSkills]);
          }
        }),
        catchError(error => {
          return throwError(() => new Error('Failed to update skill: ' + (error.message || 'Server error')));
        })
      );
  }
  
  deleteSkill(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/skills/${id}`, this.getHttpOptions())
      .pipe(
        tap(() => {
          const currentSkills = this.skillsSubject.value;
          this.skillsSubject.next(currentSkills.filter(s => s.id !== id));
        }),
        catchError(error => {
          return throwError(() => new Error('Failed to delete skill: ' + (error.message || 'Server error')));
        })
      );
  }
  
  // PROJECTS METHODS
  
  getMyProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/projects`, this.getHttpOptions())
      .pipe(
        tap(projects => {
          this.projectsSubject.next(projects);
        }),
        catchError(error => {
          return throwError(() => new Error('Failed to fetch projects: ' + (error.message || 'Server error')));
        })
      );
  }
  
  createProject(project: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/projects`, project, this.getHttpOptions())
      .pipe(
        tap(newProject => {
          const currentProjects = this.projectsSubject.value;
          this.projectsSubject.next([...currentProjects, newProject]);
        }),
        catchError(error => {
          return throwError(() => new Error('Failed to create project: ' + (error.message || 'Server error')));
        })
      );
  }
  
  updateProject(id: number, project: CreateProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/projects/${id}`, project, this.getHttpOptions())
      .pipe(
        tap(updatedProject => {
          const currentProjects = this.projectsSubject.value;
          const index = currentProjects.findIndex(p => p.id === id);
          if (index !== -1) {
            currentProjects[index] = updatedProject;
            this.projectsSubject.next([...currentProjects]);
          }
        }),
        catchError(error => {
          return throwError(() => new Error('Failed to update project: ' + (error.message || 'Server error')));
        })
      );
  }
  
  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/projects/${id}`, this.getHttpOptions())
      .pipe(
        tap(() => {
          const currentProjects = this.projectsSubject.value;
          this.projectsSubject.next(currentProjects.filter(p => p.id !== id));
        }),
        catchError(error => {
          return throwError(() => new Error('Failed to delete project: ' + (error.message || 'Server error')));
        })
      );
  }
  
  // CERTIFICATES METHODS
  
  getMyCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.apiUrl}/certificates`, this.getHttpOptions())
      .pipe(
        tap(certificates => {
          this.certificatesSubject.next(certificates);
        }),
        catchError(error => {
          return throwError(() => new Error('Failed to fetch certificates: ' + (error.message || 'Server error')));
        })
      );
  }
  
  createCertificate(certificate: CreateCertificateRequest): Observable<Certificate> {
    return this.http.post<Certificate>(`${this.apiUrl}/certificates`, certificate, this.getHttpOptions())
      .pipe(
        tap(newCertificate => {
          const currentCertificates = this.certificatesSubject.value;
          this.certificatesSubject.next([...currentCertificates, newCertificate]);
        }),
        catchError(error => {
          return throwError(() => new Error('Failed to create certificate: ' + (error.message || 'Server error')));
        })
      );
  }
  
  updateCertificate(id: number, certificate: CreateCertificateRequest): Observable<Certificate> {
    return this.http.put<Certificate>(`${this.apiUrl}/certificates/${id}`, certificate, this.getHttpOptions())
      .pipe(
        tap(updatedCertificate => {
          const currentCertificates = this.certificatesSubject.value;
          const index = currentCertificates.findIndex(c => c.id === id);
          if (index !== -1) {
            currentCertificates[index] = updatedCertificate;
            this.certificatesSubject.next([...currentCertificates]);
          }
        }),
        catchError(error => {
          return throwError(() => new Error('Failed to update certificate: ' + (error.message || 'Server error')));
        })
      );
  }
  
  deleteCertificate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/certificates/${id}`, this.getHttpOptions())
      .pipe(
        tap(() => {
          const currentCertificates = this.certificatesSubject.value;
          this.certificatesSubject.next(currentCertificates.filter(c => c.id !== id));
        }),
        catchError(error => {
          return throwError(() => new Error('Failed to delete certificate: ' + (error.message || 'Server error')));
        })
      );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking?: boolean;
  description: string;
}

export interface Project {
  name: string;
  description: string;
  url?: string;
  technologies: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Language {
  language: string;
  proficiency: string;
}

export interface CV {
  id: number;
  title: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  profile_summary?: string;
  avatar_url?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  is_primary: boolean;
  skills: string[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class CvService {
  private apiUrl = 'http://18.208.134.30/api/cvs';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  createCV(cv: Partial<CV>): Observable<CV> {
    return this.http.post<CV>(this.apiUrl, cv, {
      headers: this.getAuthHeaders()
    });
  }

  getCVs(): Observable<CV[]> {
    return this.http.get<CV[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }
  
  getCV(cvId: number): Observable<CV> {
    return this.http.get<CV>(`${this.apiUrl}/${cvId}`, {
      headers: this.getAuthHeaders()
    });
  }
  
  updateCV(cvId: number, cv: Partial<CV>): Observable<CV> {
    return this.http.put<CV>(`${this.apiUrl}/${cvId}`, cv, {
      headers: this.getAuthHeaders()
    });
  }

  setPrimaryCV(cvId: number): Observable<CV> {
    return this.http.patch<CV>(`${this.apiUrl}/${cvId}/primary`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  deleteCV(cvId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cvId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Tag management methods
  addTag(cvId: number, tag: string): Observable<CV> {
    return this.http.post<CV>(`${this.apiUrl}/${cvId}/tags`, { tag }, {
      headers: this.getAuthHeaders()
    });
  }

  removeTag(cvId: number, tag: string): Observable<CV> {
    return this.http.delete<CV>(`${this.apiUrl}/${cvId}/tags/${tag}`, {
      headers: this.getAuthHeaders()
    });
  }
  
  generateAvatarUrl(name: string): string {
    // Use the first letter of the name to generate an avatar
    const initial = name.charAt(0).toUpperCase();
    return `https://avatar-placeholder.iran.liara.run/public/${initial}`;
  }
}
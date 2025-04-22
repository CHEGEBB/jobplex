import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Education {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface Experience {
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string;
  current: boolean;
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
  name: string;
  proficiency: string;
}

export interface CV {
  id?: number;
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

  // Transform form data to match API expected format
  private transformFormDataToApiFormat(formData: any): any {
    const transformed = { ...formData };
  
    // Transform arrays
    const arrayTransformations = {
      education: ['institution', 'degree', 'field', 'startDate', 'endDate', 'description'],
      experience: ['company', 'position', 'location', 'startDate', 'endDate', 'currentlyWorking', 'description'],
      languages: ['language', 'proficiency']
    };
  
    Object.entries(arrayTransformations).forEach(([key, fields]) => {
      if (transformed[key]) {
        transformed[key] = transformed[key].map((item: any) => {
          const newItem: any = {};
          fields.forEach(field => {
            const apiField = field.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`);
            newItem[apiField] = item[field] || '';
            
            // Handle boolean fields
            if (field === 'currentlyWorking') {
              newItem.current = item[field] || false;
            }
          });
          return newItem;
        });
      }
    });
  
    // Clean empty array values
    ['skills', 'tags'].forEach(field => {
      if (transformed[field]) {
        transformed[field] = transformed[field].filter((item: string) => item.trim() !== '');
      }
    });
  
    return transformed;
  }
  
  private handleError(error: any): Error {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Server error ${error.status}: ${error.error?.message || error.statusText}`;
    }
    return new Error(errorMessage);
  }

  // Transform API data to match form structure
  private transformApiDataToFormFormat(apiData: any): any {
    if (!apiData) return apiData;
    
    // If it's an array, map each item
    if (Array.isArray(apiData)) {
      return apiData.map(item => this.transformApiDataToFormFormat(item));
    }
    
    // Clone the object to avoid mutations
    const formattedData = { ...apiData };
    
    // Transform education
    if (formattedData.education) {
      formattedData.education = formattedData.education.map((edu: any) => ({
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        startDate: edu.start_date,
        endDate: edu.end_date,
        description: edu.description
      }));
    }
    
    // Transform experience
    if (formattedData.experience) {
      formattedData.experience = formattedData.experience.map((exp: any) => ({
        company: exp.company,
        position: exp.position,
        location: exp.location,
        startDate: exp.start_date,
        endDate: exp.end_date,
        currentlyWorking: exp.current,
        description: exp.description
      }));
    }
    
    // Transform languages
    if (formattedData.languages) {
      formattedData.languages = formattedData.languages.map((lang: any) => ({
        language: lang.name,
        proficiency: lang.proficiency
      }));
    }
    
    return formattedData;
  }

  createCV(cv: any): Observable<CV> {
    const transformedData = this.transformFormDataToApiFormat(cv);
    
    return this.http.post<CV>(this.apiUrl, transformedData, {
      headers: this.getAuthHeaders()
    });
  }

  getCVs(): Observable<CV[]> {
    return new Observable<CV[]>(observer => {
      this.http.get<CV[]>(this.apiUrl, {
        headers: this.getAuthHeaders()
      }).subscribe({
        next: (data) => {
          const transformedData = this.transformApiDataToFormFormat(data);
          observer.next(transformedData);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }
  
  getCV(cvId: number): Observable<CV> {
    return new Observable<CV>(observer => {
      this.http.get<CV>(`${this.apiUrl}/${cvId}`, {
        headers: this.getAuthHeaders()
      }).subscribe({
        next: (data) => {
          const transformedData = this.transformApiDataToFormFormat(data);
          observer.next(transformedData);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }
  
  updateCV(cvId: number, cv: any): Observable<CV> {
    const transformedData = this.transformFormDataToApiFormat(cv);
    
    return this.http.put<CV>(`${this.apiUrl}/${cvId}`, transformedData, {
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
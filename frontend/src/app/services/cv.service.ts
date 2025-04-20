import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface CV {
  id: number;
  file_name: string;
  file_url: string;
  is_primary: boolean;
  tags: string[];
  uploaded_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class CvService {
  // Use the environment variable for the API URL
  private apiUrl = 'http://18.208.134.30/api/cvs'; // Hardcoded for now

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Helper method to get auth headers - for non-multipart requests
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // File upload requires special handling for headers
  uploadCV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('cv', file);
    
    // For multipart/form-data, we need to pass auth token but not set Content-Type
    // Let the browser set the Content-Type with proper boundary
    const token = this.authService.getToken();
    
    // Using a simple object for headers instead of HttpHeaders
    // This is critical for file uploads with authorization
    const options = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    return this.http.post(this.apiUrl, formData, options);
  }

  getCVs(): Observable<CV[]> {
    return this.http.get<CV[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  setPrimaryCV(cvId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${cvId}/primary`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  deleteCV(cvId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cvId}`, {
      headers: this.getAuthHeaders()
    });
  }

  downloadCV(fileUrl: string): void {
    window.open(fileUrl, '_blank');
  }

  // Tag management methods
  addTag(cvId: number, tag: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${cvId}/tags`, { tag }, {
      headers: this.getAuthHeaders()
    });
  }

  removeTag(cvId: number, tag: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cvId}/tags/${tag}`, {
      headers: this.getAuthHeaders()
    });
  }
}
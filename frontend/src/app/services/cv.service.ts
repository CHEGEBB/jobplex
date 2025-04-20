import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface CV {
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
  [x: string]: any;
  private apiUrl = '/api/cvs';

  constructor(private http: HttpClient) { }

  uploadCV(file: File) {
    const formData = new FormData();
    formData.append('cv', file);
    return this.http.post(this.apiUrl, formData);
  }

  getCVs() {
    return this.http.get<CV[]>(this.apiUrl);
  }

  setPrimaryCV(cvId: number) {
    return this.http.patch(`${this.apiUrl}/${cvId}/primary`, {});
  }

  deleteCV(cvId: number) {
    return this.http.delete(`${this.apiUrl}/${cvId}`);
  }

  downloadCV(fileUrl: string) {
    window.open(fileUrl, '_blank');
  }
}
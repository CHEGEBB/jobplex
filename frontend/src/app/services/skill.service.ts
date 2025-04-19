import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

export interface Skill {
  id: number;
  userId: number;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSkillRequest {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience: number;
}

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Helper method to get headers with auth token
  private getAuthHeaders() {
    const token = this.authService.token;
    console.log('Using token for request:', token ? 'Token exists' : 'No token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getAllSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.API_URL}/skills`);
  }

  getSkillById(id: number): Observable<Skill> {
    return this.http.get<Skill>(`${this.API_URL}/skills/${id}`);
  }

  createSkill(skill: CreateSkillRequest): Observable<Skill> {
    console.log('Before skill creation, token:', this.authService.token);
    console.log('Before skill creation, user role:', this.authService.getUserRole());
    return this.http.post<Skill>(`${this.API_URL}/skills`, skill, this.getAuthHeaders());
  }

  updateSkill(id: number, skill: Partial<CreateSkillRequest>): Observable<Skill> {
    return this.http.put<Skill>(`${this.API_URL}/skills/${id}`, skill, this.getAuthHeaders());
  }

  deleteSkill(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/skills/${id}`, this.getAuthHeaders());
  }

  getMySkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.API_URL}/skills/my-skills`, this.getAuthHeaders());
  }

  extractSkillsFromText(text: string): Observable<string[]> {
    return this.http.post<string[]>(`${this.API_URL}/skills/extract`, { text }, this.getAuthHeaders());
  }

  getSkillRecommendations(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/skills/recommendations`, this.getAuthHeaders());
  }
}
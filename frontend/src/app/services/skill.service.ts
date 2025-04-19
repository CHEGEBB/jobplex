import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service'; // Import AuthService

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
    private authService: AuthService // Inject AuthService
  ) { }

  // Helper method to get headers with auth token
  private getAuthHeaders() {
    const token = this.authService.token;
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getAllSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.API_URL}/skills`, this.getAuthHeaders());
  }

  getSkillById(id: number): Observable<Skill> {
    return this.http.get<Skill>(`${this.API_URL}/skills/${id}`, this.getAuthHeaders());
  }

  createSkill(skill: CreateSkillRequest): Observable<Skill> {
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
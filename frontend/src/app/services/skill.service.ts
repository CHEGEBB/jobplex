import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

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

  constructor(private http: HttpClient) { }

  getAllSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.API_URL}/skills`);
  }

  getSkillById(id: number): Observable<Skill> {
    return this.http.get<Skill>(`${this.API_URL}/skills/${id}`);
  }

  createSkill(skill: CreateSkillRequest): Observable<Skill> {
    return this.http.post<Skill>(`${this.API_URL}/skills`, skill);
  }

  updateSkill(id: number, skill: Partial<CreateSkillRequest>): Observable<Skill> {
    return this.http.put<Skill>(`${this.API_URL}/skills/${id}`, skill);
  }

  deleteSkill(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/skills/${id}`);
  }

  getMySkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.API_URL}/skills/my-skills`);
  }

  // This is useful for extracting skills from uploaded resume or job descriptions
  extractSkillsFromText(text: string): Observable<string[]> {
    return this.http.post<string[]>(`${this.API_URL}/skills/extract`, { text });
  }

  // For skill recommendations based on user profile or job requirements
  getSkillRecommendations(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/skills/recommendations`);
  }
}
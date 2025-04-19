// src/services/skill.service.ts (frontend)
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface Skill {
  id?: number;
  name: string;
  level: number;
  category: string;
  yearsExperience?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private apiUrl = environment.apiUrl + '/skills';

  constructor(private http: HttpClient) {}

  // Get the headers with auth token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get all skills for the authenticated user
  getUserSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Get skills by category
  getUserSkillsByCategory(category: string): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/category/${category}`, { headers: this.getHeaders() });
  }

  // Get a specific skill by ID
  getSkillById(id: number): Observable<Skill> {
    return this.http.get<Skill>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Create a new skill
  createSkill(skill: Skill): Observable<Skill> {
    return this.http.post<Skill>(this.apiUrl, skill, { headers: this.getHeaders() });
  }

  // Create and add a skill in one step
  createAndAddUserSkill(skill: Skill): Observable<Skill> {
    return this.http.post<Skill>(this.apiUrl, skill, { headers: this.getHeaders() });
  }

  // Update an existing skill
  updateSkill(id: number, skill: Partial<Skill>): Observable<Skill> {
    return this.http.put<Skill>(`${this.apiUrl}/${id}`, skill, { headers: this.getHeaders() });
  }

  // Delete a skill
  removeUserSkill(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
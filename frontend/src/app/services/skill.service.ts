// src/services/skill.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface Skill {
  id?: number;
  name: string;
  level: number;
  category: string;
  yearsExperience?: number;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private apiUrl = `${environment.apiUrl}/skills`;

  constructor(private http: HttpClient) {}

  // Get all skills for the authenticated user
  getUserSkills(): Observable<Skill[]> {
    console.log('Fetching user skills from:', this.apiUrl);
    return this.http.get<Skill[]>(this.apiUrl).pipe(
      tap(skills => console.log('Skills retrieved:', skills)),
      catchError(error => {
        console.error('Error fetching skills:', error);
        return throwError(() => new Error('Failed to fetch skills. Please try again.'));
      })
    );
  }

  // Get skills by category
  getUserSkillsByCategory(category: string): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/category/${category}`).pipe(
      catchError(error => {
        console.error(`Error fetching skills for category ${category}:`, error);
        return throwError(() => new Error(`Failed to fetch ${category} skills. Please try again.`));
      })
    );
  }

  // Get a specific skill by ID
  getSkillById(id: number): Observable<Skill> {
    return this.http.get<Skill>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching skill with id ${id}:`, error);
        return throwError(() => new Error('Failed to fetch skill details. Please try again.'));
      })
    );
  }

  // Create a new skill
  createSkill(skill: Skill): Observable<Skill> {
    console.log('Creating skill:', skill);
    return this.http.post<Skill>(this.apiUrl, skill).pipe(
      tap(createdSkill => console.log('Skill created:', createdSkill)),
      catchError(error => {
        console.error('Error creating skill:', error);
        console.error('Error details:', error.error || error.message);
        return throwError(() => new Error('Failed to create skill. Please try again.'));
      })
    );
  }

  // For backwards compatibility with your component
  createAndAddUserSkill(skill: Skill): Observable<Skill> {
    return this.createSkill(skill);
  }

  // Update an existing skill
  updateSkill(id: number, skill: Partial<Skill>): Observable<Skill> {
    return this.http.put<Skill>(`${this.apiUrl}/${id}`, skill).pipe(
      catchError(error => {
        console.error(`Error updating skill with id ${id}:`, error);
        return throwError(() => new Error('Failed to update skill. Please try again.'));
      })
    );
  }

  // Delete a skill
  removeUserSkill(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error deleting skill with id ${id}:`, error);
        return throwError(() => new Error('Failed to delete skill. Please try again.'));
      })
    );
  }
}
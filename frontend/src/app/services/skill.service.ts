// src/app/services/skill.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';

export interface Skill {
  id?: number;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'tool';
  level?: number;
  yearsExperience?: number;
}

export interface UserSkill {
  id?: number;
  userId: number;
  skillId: number;
  proficiencyLevel: number;
  yearsOfExperience?: number;
  skillName?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private apiUrl = 'http://18.208.134.30/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    console.log('Auth token being used:', token ? token.substring(0, 15) + '...' : 'MISSING');
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    });
  }
  private handleTokenRefresh(): Observable<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<{ token: string }>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        console.log('Token refreshed successfully');
      }),
      map(() => void 0)
    );
  }

  /**
   * Gets the current user's ID from localStorage
   */
  private getUserId(): string {
    const userId = localStorage.getItem('userId');
    console.log('Retrieved userId from localStorage:', userId);
    if (!userId) {
      console.warn('No userId found in localStorage, falling back to default "1"');
      return '1'; // Default to 1 if not found
    }
    return userId;
  }

  /**
   * Get all available skills
   */
  getAllSkills(): Observable<Skill[]> {
    console.log('Fetching all skills from API');
    return this.http.get<{success: boolean, data: any[]}>(`${this.apiUrl}/skills`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(response => console.log('getAllSkills response:', response)),
      map(response => {
        if (response.success && response.data) {
          return response.data.map(skill => ({
            id: skill.id,
            name: skill.name,
            category: skill.category as 'technical' | 'soft' | 'language' | 'tool'
          }));
        }
        console.warn('No skills data found in response');
        return [];
      }),
      catchError(error => {
        console.error('Error fetching skills:', error);
        console.error('Error details:', error.error || error.message);
        return throwError(() => new Error('Failed to fetch skills. Please try again.'));
      })
    );
  }

  /**
   * Get skills for a specific user
   */
  getUserSkills(userId?: string): Observable<Skill[]> {
    const targetUserId = userId || this.getUserId();
    console.log(`Fetching skills for user ${targetUserId}`);
    
    return this.http.get<{success: boolean, data: any[]}>(`${this.apiUrl}/skills/user/${targetUserId}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(response => console.log('getUserSkills response:', response)),
      map(response => {
        if (response.success && response.data) {
          return response.data.map(skill => ({
            id: skill.skillId,
            name: skill.skillName,
            category: skill.category as 'technical' | 'soft' | 'language' | 'tool',
            level: skill.proficiencyLevel,
            yearsExperience: skill.yearsOfExperience
          }));
        }
        console.warn('No user skills data found in response');
        return [];
      }),
      catchError(error => {
        console.error('Error fetching user skills:', error);
        console.error('Error details:', error.error || error.message);
        return throwError(() => new Error('Failed to fetch user skills. Please try again.'));
      })
    );
  }

  /**
   * Create a new skill
   */
  createSkill(skillData: Skill): Observable<Skill> {
    console.log('Creating new skill:', skillData);
    const payload = {
      name: skillData.name,
      category: skillData.category
    };

    return this.http.post<{success: boolean, data: any}>(`${this.apiUrl}/skills`, payload, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(response => console.log('createSkill response:', response)),
      map(response => {
        if (response.success && response.data) {
          return {
            id: response.data.id,
            name: response.data.name,
            category: response.data.category as 'technical' | 'soft' | 'language' | 'tool'
          };
        }
        console.error('Failed to create skill, unexpected response format:', response);
        throw new Error('Failed to create skill');
      }),
      catchError(error => {
        console.error('Error creating skill:', error);
        console.error('Error details:', error.error || error.message);
        return throwError(() => new Error('Failed to create skill. Please try again.'));
      })
    );
  }

  /**
   * Add a skill to the current user
   */
  addUserSkill(skillId: number, proficiencyLevel: number, yearsOfExperience?: number): Observable<UserSkill> {
    const userId = parseInt(this.getUserId());
    
    console.log('Adding user skill with params:', {userId, skillId, proficiencyLevel, yearsOfExperience});
    
    const payload = {
      userId,
      skillId,
      proficiencyLevel,
      yearsOfExperience
    };

    return this.http.post<{success: boolean, data: any}>(`${this.apiUrl}/skills/user`, payload, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => console.log('addUserSkill response:', response)),
      map(response => {
        if (response.success && response.data) {
          return {
            id: response.data.id,
            userId: response.data.userId || response.data.user_id,
            skillId: response.data.skillId || response.data.skill_id,
            proficiencyLevel: response.data.proficiencyLevel || response.data.proficiency_level,
            yearsOfExperience: response.data.yearsOfExperience || response.data.years_of_experience
          };
        }
        console.error('Failed to add user skill, unexpected response format:', response);
        throw new Error('Failed to add user skill');
      }),
      catchError(error => {
        console.error('Error adding user skill:', error);
        console.error('Error response:', error.error);
        console.error('Error status:', error.status);
        if (error.error && error.error.message) {
          console.error('Server error message:', error.error.message);
        }
        return throwError(() => new Error('Failed to add skill to your profile. Please try again.'));
      })
    );
  }

  /**
   * Remove a skill from the current user
   */
  removeUserSkill(skillId: number): Observable<{success: boolean, message: string}> {
    const userId = this.getUserId();
    console.log(`Removing skill ${skillId} from user ${userId}`);
    
    const params = new HttpParams().set('userId', userId);
    
    return this.http.delete<{success: boolean, message: string}>(`${this.apiUrl}/skills/user/${skillId}`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      tap(response => console.log('removeUserSkill response:', response)),
      catchError(error => {
        console.error('Error removing user skill:', error);
        console.error('Error details:', error.error || error.message);
        return throwError(() => new Error('Failed to remove skill. Please try again.'));
      })
    );
  }

  /**
   * Add a new skill and associate it with the current user in one operation
   */
  createAndAddUserSkill(skillData: Skill): Observable<Skill> {
    console.log('Starting createAndAddUserSkill with data:', skillData);
    console.log('Current token:', localStorage.getItem('token') ? 'Token exists' : 'Token missing');
    console.log('Current userId:', localStorage.getItem('userId'));
    
    // First check if the skill already exists
    return this.findSkillByName(skillData.name).pipe(
      tap(existingSkill => console.log('Found existing skill:', existingSkill)),
      switchMap((existingSkill: Skill | null) => {
        if (existingSkill) {
          console.log(`Skill "${skillData.name}" exists, adding to user with ID: ${existingSkill.id}`);
          // Skill exists, add it to the user
          return this.addUserSkill(
            existingSkill.id as number, 
            skillData.level || 3, 
            skillData.yearsExperience
          ).pipe(
            tap(result => console.log('User skill added successfully:', result)),
            map(() => ({
              ...existingSkill,
              level: skillData.level,
              yearsExperience: skillData.yearsExperience
            }))
          );
        } else {
          console.log(`Skill "${skillData.name}" does not exist, creating new skill`);
          // Skill doesn't exist, create it first then add to user
          return this.createSkill(skillData).pipe(
            tap(newSkill => console.log('New skill created:', newSkill)),
            switchMap((newSkill: Skill) => {
              console.log(`Adding new skill with ID ${newSkill.id} to user`);
              return this.addUserSkill(
                newSkill.id as number, 
                skillData.level || 3, 
                skillData.yearsExperience
              ).pipe(
                tap(result => console.log('User skill added successfully:', result)),
                map(() => ({
                  ...newSkill,
                  level: skillData.level,
                  yearsExperience: skillData.yearsExperience
                }))
              );
            })
          );
        }
      }),
      catchError(error => {
        console.error('Error in create and add user skill flow:', error);
        if (error.message) {
          console.error('Error message:', error.message);
        }
        if (typeof error === 'object' && error.error) {
          console.error('Error response:', error.error);
        }
        return throwError(() => new Error('Failed to add skill. Please try again.'));
      })
    );
  }

  /**
   * Find a skill by name (case insensitive)
   */
  findSkillByName(name: string): Observable<Skill | null> {
    console.log(`Searching for skill by name: "${name}"`);
    return this.getAllSkills().pipe(
      map(skills => {
        const match = skills.find(s => 
          s.name.toLowerCase() === name.toLowerCase()
        );
        console.log(`Skill search result for "${name}":`, match || 'Not found');
        return match || null;
      }),
      catchError(error => {
        console.error(`Error finding skill by name "${name}":`, error);
        console.error('Error details:', error.error || error.message);
        return of(null);
      })
    );
  }
}
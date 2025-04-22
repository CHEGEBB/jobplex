// src/app/services/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

// Types for profile data
export interface JobSeekerProfile {
  id: number;
  user_id: number;
  title: string;
  bio: string;
  location: string;
  phone: string;
  website: string;
  linkedin_url: string;
  github_url: string;
  profile_photo_url: string;
  resume_url: string;
  availability: string;
  desired_salary_range: string;
  is_remote_ok: boolean;
  willing_to_relocate: boolean;
  years_of_experience: number;
  education_level: string;
  preferred_job_types: string;
  preferred_industries: string;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  user_id: number;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience: number;
  created_at: string;
  updated_at: string;
}

export interface WorkExperience {
  id: number;
  user_id: number;
  company_name: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: number;
  user_id: number;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  user_id: number;
  document_type: string;
  document_url: string;
  filename: string;
  uploaded_at: string;
}

export interface FullProfile {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    created_at: string;
    updated_at: string;
  };
  profile: JobSeekerProfile;
  skills: Skill[];
  experience: WorkExperience[];
  education: Education[];
  documents: Document[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly API_URL = environment.apiUrl;
  private profileSubject = new BehaviorSubject<FullProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }
  
  // Calculate profile completion percentage
  getProfileCompletionPercentage(): Observable<number> {
    return this.profile$.pipe(
      map(profile => {
        if (!profile) return 0;
        
        let totalFields = 0;
        let filledFields = 0;
        
        // Check profile fields
        const profileChecks = [
          'title', 'bio', 'location', 'phone', 'website', 
          'linkedin_url', 'github_url', 'profile_photo_url', 'resume_url'
        ];
        
        totalFields += profileChecks.length;
        profileChecks.forEach(field => {
          if (profile.profile[field as keyof JobSeekerProfile]) filledFields++;
        });
        
        // Add points for skills, experience, education
        if (profile.skills.length > 0) filledFields++;
        totalFields++;
        
        if (profile.experience.length > 0) filledFields++;
        totalFields++;
        
        if (profile.education.length > 0) filledFields++;
        totalFields++;
        
        return Math.round((filledFields / totalFields) * 100);
      })
    );
  }
  
  // Get the full profile
  getFullProfile(): Observable<FullProfile> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<FullProfile>(`${this.API_URL}/profile`, { headers }).pipe(
      tap(profile => {
        this.profileSubject.next(profile);
      }),
      catchError(this.handleError)
    );
  }
  
  // Update basic profile
  updateProfile(profileData: Partial<JobSeekerProfile>): Observable<{ success: boolean; profile: JobSeekerProfile }> {
    const headers = this.getAuthHeaders();
    
    return this.http.put<{ success: boolean; profile: JobSeekerProfile }>(
      `${this.API_URL}/profile`, 
      profileData, 
      { headers }
    ).pipe(
      tap(response => {
        // Update the stored profile
        const currentProfile = this.profileSubject.value;
        if (currentProfile) {
          const updatedProfile = {
            ...currentProfile,
            profile: response.profile
          };
          this.profileSubject.next(updatedProfile);
        }
      }),
      catchError(this.handleError)
    );
  }
  
  // Upload profile photo
  uploadProfilePhoto(photoUrl: string): Observable<{ success: boolean; profile: JobSeekerProfile }> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<{ success: boolean; profile: JobSeekerProfile }>(
      `${this.API_URL}/profile/photo`,
      { photoUrl },
      { headers }
    ).pipe(
      tap(response => {
        // Update the stored profile
        const currentProfile = this.profileSubject.value;
        if (currentProfile) {
          const updatedProfile = {
            ...currentProfile,
            profile: response.profile
          };
          this.profileSubject.next(updatedProfile);
        }
      }),
      catchError(this.handleError)
    );
  }
  
  // Add or update skill
  addSkill(skillData: Partial<Skill>): Observable<{ success: boolean; skill: Skill }> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<{ success: boolean; skill: Skill }>(
      `${this.API_URL}/profile/skills`,
      skillData,
      { headers }
    ).pipe(
      tap(response => {
        // Update the stored profile skills
        const currentProfile = this.profileSubject.value;
        if (currentProfile) {
          const existingSkillIndex = currentProfile.skills.findIndex(s => s.name === response.skill.name);
          
          if (existingSkillIndex >= 0) {
            // Update existing skill
            const updatedSkills = [...currentProfile.skills];
            updatedSkills[existingSkillIndex] = response.skill;
            
            const updatedProfile = {
              ...currentProfile,
              skills: updatedSkills
            };
            this.profileSubject.next(updatedProfile);
          } else {
            // Add new skill
            const updatedProfile = {
              ...currentProfile,
              skills: [...currentProfile.skills, response.skill]
            };
            this.profileSubject.next(updatedProfile);
          }
        }
      }),
      catchError(this.handleError)
    );
  }
  
  // Remove skill
  removeSkill(skillId: number): Observable<{ success: boolean; message: string }> {
    const headers = this.getAuthHeaders();
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.API_URL}/profile/skills/${skillId}`,
      { headers }
    ).pipe(
      tap(() => {
        // Update the stored profile skills
        const currentProfile = this.profileSubject.value;
        if (currentProfile) {
          const updatedProfile = {
            ...currentProfile,
            skills: currentProfile.skills.filter(s => s.id !== skillId)
          };
          this.profileSubject.next(updatedProfile);
        }
      }),
      catchError(this.handleError)
    );
  }
  
  // Add work experience
  addExperience(experienceData: Partial<WorkExperience>): Observable<{ success: boolean; experience: WorkExperience }> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<{ success: boolean; experience: WorkExperience }>(
      `${this.API_URL}/profile/experience`,
      experienceData,
      { headers }
    ).pipe(
      tap(response => {
        // Update the stored profile experiences
        const currentProfile = this.profileSubject.value;
        if (currentProfile) {
          const updatedProfile = {
            ...currentProfile,
            experience: [...currentProfile.experience, response.experience].sort((a, b) => {
              // Sort by current first, then by end date (most recent first)
              if (a.is_current && !b.is_current) return -1;
              if (!a.is_current && b.is_current) return 1;
              
              const aDate = a.end_date ? new Date(a.end_date) : new Date();
              const bDate = b.end_date ? new Date(b.end_date) : new Date();
              return bDate.getTime() - aDate.getTime();
            })
          };
          this.profileSubject.next(updatedProfile);
        }
      }),
      catchError(this.handleError)
    );
  }
  
  // Update work experience
  updateExperience(experienceId: number, experienceData: Partial<WorkExperience>): Observable<{ success: boolean; experience: WorkExperience }> {
    const headers = this.getAuthHeaders();
    
    return this.http.put<{ success: boolean; experience: WorkExperience }>(
      `${this.API_URL}/profile/experience/${experienceId}`,
      experienceData,
      { headers }
    ).pipe(
      tap(response => {
        // Update the stored profile experiences
        const currentProfile = this.profileSubject.value;
        if (currentProfile) {
          const updatedExperiences = currentProfile.experience.map(exp => 
            exp.id === experienceId ? response.experience : exp
          );
          
          const updatedProfile = {
            ...currentProfile,
            experience: updatedExperiences
          };
          this.profileSubject.next(updatedProfile);
        }
      }),
      catchError(this.handleError)
    );
  }
  
  // Delete work experience
  deleteExperience(experienceId: number): Observable<{ success: boolean; message: string }> {
    const headers = this.getAuthHeaders();
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.API_URL}/profile/experience/${experienceId}`,
      { headers }
    ).pipe(
      tap(() => {
        // Update the stored profile experiences
        const currentProfile = this.profileSubject.value;
        if (currentProfile) {
          const updatedProfile = {
            ...currentProfile,
            experience: currentProfile.experience.filter(exp => exp.id !== experienceId)
          };
          this.profileSubject.next(updatedProfile);
        }
      }),
      catchError(this.handleError)
    );
  }
  
  // Add education
  addEducation(educationData: Partial<Education>): Observable<{ success: boolean; education: Education }> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<{ success: boolean; education: Education }>(
      `${this.API_URL}/profile/education`,
      educationData,
      { headers }
    ).pipe(
      tap(response => {
        // Update the stored profile education
        const currentProfile = this.profileSubject.value;
        if (currentProfile) {
          const updatedProfile = {
            ...currentProfile,
            education: [...currentProfile.education, response.education].sort((a, b) => {
              // Sort by current first, then by end date (most recent first)
              if (a.is_current && !b.is_current) return -1;
              if (!a.is_current && b.is_current) return 1;
              
              const aDate = a.end_date ? new Date(a.end_date) : new Date();
              const bDate = b.end_date ? new Date(b.end_date) : new Date();
              return bDate.getTime() - aDate.getTime();
            })
          };
          this.profileSubject.next(updatedProfile);
        }
      }),
      catchError(this.handleError)
    );
  }
  
  // Update education
  updateEducation(educationId: number, educationData: Partial<Education>): Observable<{ success: boolean; education: Education }> {
    const headers = this.getAuthHeaders();
    
    return this.http.put<{ success: boolean; education: Education }>(
      `${this.API_URL}/profile/education/${educationId}`,
      educationData,
      { headers }
    ).pipe(
      tap(response => {
        // Update the stored profile education
        const currentProfile = this.profileSubject.value;
        if (currentProfile) {
          const updatedEducation = currentProfile.education.map(edu => 
            edu.id === educationId ? response.education : edu
          );
          
          const updatedProfile = {
            ...currentProfile,
            education: updatedEducation
          };
          this.profileSubject.next(updatedProfile);
        }
      }),
      catchError(this.handleError)
    );
  }
  
  // Delete education
  deleteEducation(educationId: number): Observable<{ success: boolean; message: string }> {
    const headers = this.getAuthHeaders();
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.API_URL}/profile/education/${educationId}`,
      { headers }
    ).pipe(
      tap(() => {
        // Update the stored profile education
        const currentProfile = this.profileSubject.value;
        if (currentProfile) {
          const updatedProfile = {
            ...currentProfile,
            education: currentProfile.education.filter(edu => edu.id !== educationId)
          };
          this.profileSubject.next(updatedProfile);
        }
      }),
      catchError(this.handleError)
    );
  }
  
  // Upload document
  uploadDocument(documentData: { document_type: string; document_url: string; filename: string }): Observable<{ success: boolean; document: Document }> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<{ success: boolean; document: Document }>(
      `${this.API_URL}/profile/documents`,
      documentData,
      { headers }
    ).pipe(
      tap(response => {
        // Update the stored profile documents
        const currentProfile = this.profileSubject.value;
        if (currentProfile) {
          // If this is a resume, also update the profile resume_url
          let updatedProfile = {
            ...currentProfile,
            documents: [...currentProfile.documents, response.document]
          };
          
          if (documentData.document_type === 'resume') {
            updatedProfile = {
              ...updatedProfile,
              profile: {
                ...updatedProfile.profile,
                resume_url: documentData.document_url
              }
            };
          }
          
          this.profileSubject.next(updatedProfile);
        }
      }),
      catchError(this.handleError)
    );
  }
  
  // Delete document
  deleteDocument(documentId: number): Observable<{ success: boolean; message: string }> {
    const headers = this.getAuthHeaders();
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.API_URL}/profile/documents/${documentId}`,
      { headers }
    ).pipe(
      tap(() => {
        // Update the stored profile documents
        const currentProfile = this.profileSubject.value;
        if (currentProfile) {
          const deletedDocument = currentProfile.documents.find(doc => doc.id === documentId);
          let updatedProfile = {
            ...currentProfile,
            documents: currentProfile.documents.filter(doc => doc.id !== documentId)
          };
          
          // If this was a resume, also clear the profile resume_url
          if (deletedDocument && deletedDocument.document_type === 'resume') {
            updatedProfile = {
              ...updatedProfile,
              profile: {
                ...updatedProfile.profile,
                resume_url: null as any
              }
            };
          }
          
          this.profileSubject.next(updatedProfile);
        }
      }),
      catchError(this.handleError)
    );
  }
  
  // Helper methods
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  
  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
// src/app/pages/jobseeker/profile/jobseeker-profile.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { ProfileService, FullProfile, Skill, WorkExperience, Education, Document } from '../../../services/profile.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-jobseeker-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './jobseeker-profile.component.html',
  styleUrls: ['./jobseeker-profile.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('400ms 100ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class JobseekerProfileComponent implements OnInit, OnDestroy {
  profileCompletion = 0;
  sidebarCollapsed = false;
  isLoading = true;
  
  // Profile data
  profileData: FullProfile | null = null;
  
  // Form for profile editing
  profileForm: FormGroup;
  
  // Forms for adding/editing experiences, education, etc.
  skillForm: FormGroup;
  experienceForm: FormGroup;
  educationForm: FormGroup;
  
  // UI state
  isEditingProfile = false;
  isAddingSkill = false;
  isAddingExperience = false;
  isAddingEducation = false;
  editingExperienceId: number | null = null;
  editingEducationId: number | null = null;
  
  // Handle file uploads
  selectedFile: File | null = null;
  uploadProgress = 0;
  
  // Subscription to clean up on destroy
  private subscriptions = new Subscription();
  
  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder
  ) {
    // Initialize forms
    this.profileForm = this.fb.group({
      title: ['', Validators.required],
      bio: [''],
      location: [''],
      phone: [''],
      website: [''],
      linkedin_url: [''],
      github_url: [''],
      availability: [''],
      desired_salary_range: [''],
      is_remote_ok: [true],
      willing_to_relocate: [false],
      years_of_experience: [0],
      education_level: [''],
      preferred_job_types: [''],
      preferred_industries: ['']
    });
    
    this.skillForm = this.fb.group({
      name: ['', Validators.required],
      proficiency: ['intermediate', Validators.required],
      years_experience: [0, [Validators.required, Validators.min(0)]]
    });
    
    this.experienceForm = this.fb.group({
      company_name: ['', Validators.required],
      position: ['', Validators.required],
      location: [''],
      start_date: ['', Validators.required],
      end_date: [''],
      is_current: [false],
      description: ['']
    });
    
    this.educationForm = this.fb.group({
      institution: ['', Validators.required],
      degree: [''],
      field_of_study: [''],
      start_date: ['', Validators.required],
      end_date: [''],
      is_current: [false],
      description: ['']
    });
  }
  
  ngOnInit(): void {
    this.sidebarCollapsed = window.innerWidth < 768;
    
    // Load profile data
    this.loadProfileData();
    
    // Subscribe to profile completion updates
    this.subscriptions.add(
      this.profileService.getProfileCompletionPercentage().subscribe(percentage => {
        this.profileCompletion = percentage;
      })
    );
    
    // Watch for form changes
    this.subscriptions.add(
      this.experienceForm.get('is_current')?.valueChanges.subscribe(isCurrent => {
        const endDateControl = this.experienceForm.get('end_date');
        if (isCurrent) {
          endDateControl?.disable();
          endDateControl?.setValue(null);
        } else {
          endDateControl?.enable();
        }
      })
    );
    
    this.subscriptions.add(
      this.educationForm.get('is_current')?.valueChanges.subscribe(isCurrent => {
        const endDateControl = this.educationForm.get('end_date');
        if (isCurrent) {
          endDateControl?.disable();
          endDateControl?.setValue(null);
        } else {
          endDateControl?.enable();
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.unsubscribe();
  }
  
  loadProfileData(): void {
    this.isLoading = true;
    
    this.subscriptions.add(
      this.profileService.getFullProfile().subscribe({
        next: (profile) => {
          this.profileData = profile;
          this.isLoading = false;
          
          // Populate profile form with data
          this.profileForm.patchValue(profile.profile);
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.isLoading = false;
        }
      })
    );
  }
  
  onToggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
  
  // Profile editing
  startEditingProfile(): void {
    this.isEditingProfile = true;
  }
  
  saveProfile(): void {
    if (this.profileForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    const profileData = this.profileForm.value;
    
    this.subscriptions.add(
      this.profileService.updateProfile(profileData).subscribe({
        next: (response) => {
          this.isEditingProfile = false;
        },
        error: (error) => {
          console.error('Error updating profile:', error);
        }
      })
    );
  }
  
  cancelEditingProfile(): void {
    // Reset form to original values
    if (this.profileData) {
      this.profileForm.patchValue(this.profileData.profile);
    }
    this.isEditingProfile = false;
  }
  
  // Skills management
  startAddingSkill(): void {
    this.skillForm.reset({
      name: '',
      proficiency: 'intermediate',
      years_experience: 0
    });
    this.isAddingSkill = true;
  }
  
  saveSkill(): void {
    if (this.skillForm.invalid) {
      Object.keys(this.skillForm.controls).forEach(key => {
        this.skillForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    const skillData = this.skillForm.value;
    
    this.subscriptions.add(
      this.profileService.addSkill(skillData).subscribe({
        next: () => {
          this.isAddingSkill = false;
        },
        error: (error) => {
          console.error('Error adding skill:', error);
        }
      })
    );
  }
  
  cancelAddingSkill(): void {
    this.isAddingSkill = false;
  }
  
  removeSkill(skillId: number): void {
    if (confirm('Are you sure you want to remove this skill?')) {
      this.subscriptions.add(
        this.profileService.removeSkill(skillId).subscribe({
          error: (error) => {
            console.error('Error removing skill:', error);
          }
        })
      );
    }
  }
  
  // Experience management
  startAddingExperience(): void {
    this.experienceForm.reset({
      company_name: '',
      position: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: ''
    });
    this.isAddingExperience = true;
    this.editingExperienceId = null;
  }
  
  startEditingExperience(experience: WorkExperience): void {
    this.experienceForm.patchValue({
      company_name: experience.company_name,
      position: experience.position,
      location: experience.location,
      start_date: this.formatDateForInput(experience.start_date),
      end_date: experience.end_date ? this.formatDateForInput(experience.end_date) : '',
      is_current: experience.is_current,
      description: experience.description
    });
    
    // If current job, disable end date
    if (experience.is_current) {
      this.experienceForm.get('end_date')?.disable();
    } else {
      this.experienceForm.get('end_date')?.enable();
    }
    
    this.isAddingExperience = true;
    this.editingExperienceId = experience.id;
  }
  
  saveExperience(): void {
    if (this.experienceForm.invalid) {
      Object.keys(this.experienceForm.controls).forEach(key => {
        this.experienceForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    const experienceData = this.experienceForm.getRawValue(); // Get values including disabled fields
    
    if (this.editingExperienceId) {
      // Update existing experience
      this.subscriptions.add(
        this.profileService.updateExperience(this.editingExperienceId, experienceData).subscribe({
          next: () => {
            this.isAddingExperience = false;
            this.editingExperienceId = null;
          },
          error: (error) => {
            console.error('Error updating experience:', error);
          }
        })
      );
    } else {
      // Add new experience
      this.subscriptions.add(
        this.profileService.addExperience(experienceData).subscribe({
          next: () => {
            this.isAddingExperience = false;
          },
          error: (error) => {
            console.error('Error adding experience:', error);
          }
        })
      );
    }
  }
  
  cancelAddingExperience(): void {
    this.isAddingExperience = false;
    this.editingExperienceId = null;
  }
  
  deleteExperience(experienceId: number): void {
    if (confirm('Are you sure you want to delete this experience?')) {
      this.subscriptions.add(
        this.profileService.deleteExperience(experienceId).subscribe({
          error: (error) => {
            console.error('Error deleting experience:', error);
          }
        })
      );
    }
  }
  
  // Education management
  startAddingEducation(): void {
    this.educationForm.reset({
      institution: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: ''
    });
    this.isAddingEducation = true;
    this.editingEducationId = null;
  }
  
  startEditingEducation(education: Education): void {
    this.educationForm.patchValue({
      institution: education.institution,
      degree: education.degree,
      field_of_study: education.field_of_study,
      start_date: this.formatDateForInput(education.start_date),
      end_date: education.end_date ? this.formatDateForInput(education.end_date) : '',
      is_current: education.is_current,
      description: education.description
    });
    
    // If current education, disable end date
    if (education.is_current) {
      this.educationForm.get('end_date')?.disable();
    } else {
      this.educationForm.get('end_date')?.enable();
    }
    
    this.isAddingEducation = true;
    this.editingEducationId = education.id;
  }
  
  saveEducation(): void {
    if (this.educationForm.invalid) {
      Object.keys(this.educationForm.controls).forEach(key => {
        this.educationForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    const educationData = this.educationForm.getRawValue(); // Get values including disabled fields
    
    if (this.editingEducationId) {
      // Update existing education
      this.subscriptions.add(
        this.profileService.updateEducation(this.editingEducationId, educationData).subscribe({
          next: () => {
            this.isAddingEducation = false;
            this.editingEducationId = null;
          },
          error: (error) => {
            console.error('Error updating education:', error);
          }
        })
      );
    } else {
      // Add new education
      this.subscriptions.add(
        this.profileService.addEducation(educationData).subscribe({
          next: () => {
            this.isAddingEducation = false;
          },
          error: (error) => {
            console.error('Error adding education:', error);
          }
        })
      );
    }
  }
  
  cancelAddingEducation(): void {
    this.isAddingEducation = false;
    this.editingEducationId = null;
  }
  
  deleteEducation(educationId: number): void {
    if (confirm('Are you sure you want to delete this education?')) {
      this.subscriptions.add(
        this.profileService.deleteEducation(educationId).subscribe({
          error: (error) => {
            console.error('Error deleting education:', error);
          }
        })
      );
    }
  }
  
  // File upload handling
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadDocument('resume');
    }
  }
  
  uploadDocument(documentType: string): void {
    if (!this.selectedFile) {
      return;
    }
    
    // In a real app, you'd upload to S3 or another storage service
    // This is a simulated upload for demonstration
    const mockUpload = () => {
      // Simulate upload progress
      const interval = setInterval(() => {
        this.uploadProgress += 10;
        if (this.uploadProgress >= 100) {
          clearInterval(interval);
          
          // Simulate a generated URL
          const documentUrl = `https://jobplex-documents.s3.amazonaws.com/${Date.now()}-${this.selectedFile?.name}`;
          
          // Save document reference to database
          this.saveDocumentReference(documentType, documentUrl, this.selectedFile?.name || 'document');
        }
      }, 200);
    };
    
    // Start mock upload
    this.uploadProgress = 0;
    mockUpload();
  }
  
  saveDocumentReference(documentType: string, documentUrl: string, filename: string): void {
    this.subscriptions.add(
      this.profileService.uploadDocument({
        document_type: documentType,
        document_url: documentUrl,
        filename: filename
      }).subscribe({
        next: () => {
          this.selectedFile = null;
          this.uploadProgress = 0;
        },
        error: (error) => {
          console.error('Error saving document reference:', error);
          this.uploadProgress = 0;
        }
      })
    );
  }
  
  deleteDocument(documentId: number): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.subscriptions.add(
        this.profileService.deleteDocument(documentId).subscribe({
          error: (error) => {
            console.error('Error deleting document:', error);
          }
        })
      );
    }
  }
  
  // Helper methods
  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
  
  formatDate(dateString: string | null): string {
    if (!dateString) return 'Present';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  
  getProficiencyLabel(proficiency: string): string {
    const labels: Record<string, string> = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced',
      'expert': 'Expert'
    };
    
    return labels[proficiency] || proficiency;
  }
  
  getProficiencyColorClass(proficiency: string): string {
    const classes: Record<string, string> = {
      'beginner': 'bg-blue-100 text-blue-700',
      'intermediate': 'bg-green-100 text-green-700',
      'advanced': 'bg-purple-100 text-purple-700',
      'expert': 'bg-orange-100 text-orange-700'
    };
    
    return classes[proficiency] || 'bg-gray-100 text-gray-700';
  }
}
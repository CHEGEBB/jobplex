import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { CvService, CV } from '../../../services/cv.service';
import { finalize } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-cv-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent, HttpClientModule],
  templateUrl: './cv-manager.component.html',
  styleUrls: ['./cv-manager.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class CvManagerComponent implements OnInit {
  // UI state
  sidebarCollapsed = false;
  isGridView = true;
  isLoading = false;
  hasError = false;
  errorMessage = '';
  showCvForm = false;
  editMode = false;
  currentCvId: number | null = null;
  step = 1;
  maxSteps = 7;
  
  // Avatar options
  avatars = [
    'https://avatar.iran.liara.run/public/boy',
    'https://avatar.iran.liara.run/public/girl',
    'https://avatar.iran.liara.run/public/boy?username=Scott',
    'https://avatar.iran.liara.run/public/girl?username=Maria',
    'https://avatar.iran.liara.run/public/job/doctor/male',
    'https://avatar.iran.liara.run/public',
    'https://avatar.iran.liara.run/public/job/doctor/female',
    'https://avatar.iran.liara.run/public/2'
  ];
  
  // Available tags and proficiency levels
  availableTags = ['Remote', 'Tech', 'Finance', 'Marketing', 'Design', 'Entry Level', 'Senior', 'Contract'];
  proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Native'];
  
  // CV Data
  cvList: CV[] = [];
  
  // Form
  cvForm: FormGroup;
  
  constructor(
    public fb: FormBuilder,
    private cvService: CvService
  ) {
    this.cvForm = this.createCvForm();
  }
  
  ngOnInit(): void {
    this.loadCVs();
  }
  
  createCvForm(): FormGroup {
    return this.fb.group({
      // Personal Details
      title: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      city: [''],
      country: [''],
      postal_code: [''],
      profile_summary: [''],
      avatar_url: ['https://avatar-placeholder.iran.liara.run/public/boy'],
      website: [''],
      linkedin: [''],
      github: [''],
      
      // Skills
      skills: this.fb.array([]),
      
      // Education
      education: this.fb.array([]),
      
      // Experience
      experience: this.fb.array([]),
      
      // Projects
      projects: this.fb.array([]),
      
      // Certifications
      certifications: this.fb.array([]),
      
      // Languages
      languages: this.fb.array([]),
      
      // Tags
      tags: this.fb.array([])
    });
  }
  
  // Form array getters
  get skillsArray(): FormArray {
    return this.cvForm.get('skills') as FormArray;
  }
  
  get educationArray(): FormArray {
    return this.cvForm.get('education') as FormArray;
  }
  
  get experienceArray(): FormArray {
    return this.cvForm.get('experience') as FormArray;
  }
  
  get projectsArray(): FormArray {
    return this.cvForm.get('projects') as FormArray;
  }
  
  get certificationsArray(): FormArray {
    return this.cvForm.get('certifications') as FormArray;
  }
  
  get languagesArray(): FormArray {
    return this.cvForm.get('languages') as FormArray;
  }
  
  get tagsArray(): FormArray {
    return this.cvForm.get('tags') as FormArray;
  }
  
  // Form array add methods
  addSkill(): void {
    this.skillsArray.push(this.fb.control('', Validators.required));
  }
  
  addEducation(): void {
    this.educationArray.push(this.fb.group({
      institution: ['', Validators.required],
      degree: ['', Validators.required],
      field: ['', Validators.required],
      start_date: [''],
      end_date: [''],
      description: ['']
    }));
  }
  
  addExperience(): void {
    this.experienceArray.push(this.fb.group({
      company: ['', Validators.required],
      position: ['', Validators.required],
      location: [''],
      start_date: [''],
      end_date: [''],
      currently_working: [false],
      description: ['']
    }));
  }
  
  addProject(): void {
    this.projectsArray.push(this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      url: [''],
      technologies: this.fb.array([this.fb.control('')])
    }));
  }
  
  addCertification(): void {
    this.certificationsArray.push(this.fb.group({
      name: ['', Validators.required],
      issuer: ['', Validators.required],
      date: [''],
      url: ['']
    }));
  }
  
  addLanguage(): void {
    this.languagesArray.push(this.fb.group({
      name: ['', Validators.required],
      proficiency: ['', Validators.required]
    }));
  }
  
  addTag(): void {
    this.tagsArray.push(this.fb.control('', Validators.required));
  }
  
  // Remove items from form arrays
  removeFormArrayItem(formArray: FormArray, index: number): void {
    formArray.removeAt(index);
  }
  
  // Add technology to a project
  addTechnology(projectIndex: number): void {
    const technologies = (this.projectsArray.at(projectIndex).get('technologies') as FormArray);
    technologies.push(this.fb.control(''));
  }
  
  // Remove technology from a project
  removeTechnology(projectIndex: number, techIndex: number): void {
    const technologies = (this.projectsArray.at(projectIndex).get('technologies') as FormArray);
    technologies.removeAt(techIndex);
  }
  
  // Get technologies form array for a specific project
  getTechnologies(projectIndex: number): FormArray {
    return this.projectsArray.at(projectIndex).get('technologies') as FormArray;
  }
  
  loadCVs(): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.cvService.getCVs()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (cvs) => {
          this.cvList = cvs;
        },
        error: (err) => {
          console.error('Error loading CVs:', err);
          this.hasError = true;
          this.errorMessage = 'Failed to load your CVs. Please try again later.';
        }
      });
  }
  
  onToggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
  
  toggleView(): void {
    this.isGridView = !this.isGridView;
  }
  
  openCvForm(): void {
    this.showCvForm = true;
    this.editMode = false;
    this.currentCvId = null;
    this.step = 1;
    this.cvForm = this.createCvForm();
    
    // Initialize with empty skills, education, etc.
    this.addSkill();
    this.addEducation();
    this.addExperience();
    this.addLanguage();
  }
  
  editCV(cv: CV): void {
    this.showCvForm = true;
    this.editMode = true;
    this.currentCvId = cv.id;
    this.step = 1;
    
    // Reset the form
    this.cvForm = this.createCvForm();
    
    // Populate the form with existing CV data
    this.cvForm.patchValue({
      title: cv.title,
      first_name: cv.first_name,
      last_name: cv.last_name,
      email: cv.email,
      phone: cv.phone || '',
      address: cv.address || '',
      city: cv.city || '',
      country: cv.country || '',
      postal_code: cv.postal_code || '',
      profile_summary: cv.profile_summary || '',
      avatar_url: cv.avatar_url || this.avatars[0],
      website: cv.website || '',
      linkedin: cv.linkedin || '',
      github: cv.github || ''
    });
    
    // Clear existing form arrays
    while (this.skillsArray.length) {
      this.skillsArray.removeAt(0);
    }
    
    while (this.educationArray.length) {
      this.educationArray.removeAt(0);
    }
    
    while (this.experienceArray.length) {
      this.experienceArray.removeAt(0);
    }
    
    while (this.projectsArray.length) {
      this.projectsArray.removeAt(0);
    }
    
    while (this.certificationsArray.length) {
      this.certificationsArray.removeAt(0);
    }
    
    while (this.languagesArray.length) {
      this.languagesArray.removeAt(0);
    }
    
    while (this.tagsArray.length) {
      this.tagsArray.removeAt(0);
    }
    
    // Add skills
    if (cv.skills && cv.skills.length) {
      cv.skills.forEach(skill => {
        this.skillsArray.push(this.fb.control(skill, Validators.required));
      });
    } else {
      this.addSkill();
    }
    
    // Add education
    if (cv.education && cv.education.length) {
      cv.education.forEach(education => {
        this.educationArray.push(this.fb.group({
          institution: [education.institution, Validators.required],
          degree: [education.degree, Validators.required],
          field: [education.field, Validators.required],
          start_date: [education.start_date || ''],
          end_date: [education.end_date || ''],
          description: [education.description || '']
        }));
      });
    } else {
      this.addEducation();
    }
    
   // Add experience
if (cv.experience && cv.experience.length) {
  cv.experience.forEach(experience => {
    this.experienceArray.push(this.fb.group({
      company: [experience.company, Validators.required],
      position: [experience.position, Validators.required],
      location: [experience.location || ''],
      start_date: [experience.start_date || ''],
      end_date: [experience.end_date || ''],
      currently_working: [false], // Use default value instead of accessing non-existent property
      description: [experience.description || '']
    }));
  });
} else {
  this.addExperience();
}
    
    // Add projects
    if (cv.projects && cv.projects.length) {
      cv.projects.forEach(project => {
        const projectGroup = this.fb.group({
          name: [project.name, Validators.required],
          description: [project.description, Validators.required],
          url: [project.url || ''],
          technologies: this.fb.array([])
        });
        
        const techArray = projectGroup.get('technologies') as FormArray;
        
        if (project.technologies && project.technologies.length) {
          project.technologies.forEach(tech => {
            techArray.push(this.fb.control(tech));
          });
        } else {
          techArray.push(this.fb.control(''));
        }
        
        this.projectsArray.push(projectGroup);
      });
    } else {
      this.addProject();
    }
    
    // Add certifications
    if (cv.certifications && cv.certifications.length) {
      cv.certifications.forEach(cert => {
        this.certificationsArray.push(this.fb.group({
          name: [cert.name, Validators.required],
          issuer: [cert.issuer, Validators.required],
          date: [cert.date || ''],
          url: [cert.url || '']
        }));
      });
    } else {
      this.addCertification();
    }
    
    // Add languages
    if (cv.languages && cv.languages.length) {
      cv.languages.forEach(lang => {
        this.languagesArray.push(this.fb.group({
          name: [lang.name, Validators.required],
          proficiency: [lang.proficiency, Validators.required]
        }));
      });
    } else {
      this.addLanguage();
    }
    
    // Add tags
    if (cv.tags && cv.tags.length) {
      cv.tags.forEach(tag => {
        this.tagsArray.push(this.fb.control(tag, Validators.required));
      });
    }
  }
  
  closeCvForm(): void {
    this.showCvForm = false;
  }
  
  nextStep(): void {
    if (this.step < this.maxSteps) {
      this.step++;
    }
  }
  
  prevStep(): void {
    if (this.step > 1) {
      this.step--;
    }
  }
  
  saveCV(): void {
    if (this.cvForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.cvForm);
      return;
    }
    
    this.isLoading = true;
    
    if (this.editMode && this.currentCvId) {
      // Update existing CV
      this.cvService.updateCV(this.currentCvId, this.cvForm.value)
        .pipe(finalize(() => {
          this.isLoading = false;
          this.showCvForm = false;
        }))
        .subscribe({
          next: (updatedCV) => {
            // Replace the old CV with the updated one
            const index = this.cvList.findIndex(cv => cv.id === this.currentCvId);
            if (index !== -1) {
              this.cvList[index] = updatedCV;
            }
          },
          error: (err) => {
            console.error('Error updating CV:', err);
            alert('Failed to update CV. Please try again later.');
          }
        });
    } else {
      // Create new CV
      this.cvService.createCV(this.cvForm.value)
        .pipe(finalize(() => {
          this.isLoading = false;
          this.showCvForm = false;
        }))
        .subscribe({
          next: (newCV) => {
            // Add new CV to the list
            this.cvList.unshift(newCV);
          },
          error: (err) => {
            console.error('Error creating CV:', err);
            alert('Failed to create CV. Please try again later.');
          }
        });
    }
  }
  
  // Helper to mark all form controls as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        for (let i = 0; i < control.length; i++) {
          const arrayControl = control.at(i);
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        }
      }
    });
  }
  
  setPrimaryCV(cvId: number): void {
    this.isLoading = true;
    this.cvService.setPrimaryCV(cvId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (updatedCV) => {
          // Update primary status across all CVs
          this.cvList.forEach(cv => {
            cv.is_primary = cv.id === cvId;
          });
        },
        error: (err) => {
          console.error('Error setting primary CV:', err);
          alert('Failed to set primary CV. Please try again later.');
        }
      });
  }
  
  deleteCV(cvId: number): void {
    if (confirm('Are you sure you want to delete this CV?')) {
      this.isLoading = true;
      this.cvService.deleteCV(cvId)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            // Remove from the list
            this.cvList = this.cvList.filter(cv => cv.id !== cvId);
          },
          error: (err) => {
            console.error('Error deleting CV:', err);
            alert('Failed to delete CV. Please try again later.');
          }
        });
    }
  }
  
  // Tag operations
  addCvTag(cv: CV, tag: string): void {
    if (!tag || cv.tags.includes(tag)) {
      return;
    }
    
    this.isLoading = true;
    this.cvService.addTag(cv.id, tag)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (updatedCV) => {
          // Update the CV with new tags
          const index = this.cvList.findIndex(c => c.id === cv.id);
          if (index !== -1) {
            this.cvList[index].tags = updatedCV.tags;
          }
        },
        error: (err) => {
          console.error('Error adding tag:', err);
          alert('Failed to add tag. Please try again.');
        }
      });
  }
  
  removeCvTag(cv: CV, tag: string): void {
    this.isLoading = true;
    this.cvService.removeTag(cv.id, tag)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (updatedCV) => {
          // Update the CV with new tags
          const index = this.cvList.findIndex(c => c.id === cv.id);
          if (index !== -1) {
            this.cvList[index].tags = updatedCV.tags;
          }
        },
        error: (err) => {
          console.error('Error removing tag:', err);
          alert('Failed to remove tag. Please try again.');
        }
      });
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  selectAvatar(url: string): void {
    this.cvForm.patchValue({
      avatar_url: url
    });
  }
  
  // Generate a display name from the form
  getDisplayName(): string {
    const firstName = this.cvForm.get('first_name')?.value || '';
    const lastName = this.cvForm.get('last_name')?.value || '';
    return `${firstName} ${lastName}`.trim() || 'New CV';
  }
  
  // Get a summary for display in the CV card
  getCvSummary(cv: CV): string {
    const skills = cv.skills || [];
    if (skills.length > 0) {
      return `Skills: ${skills.slice(0, 3).join(', ')}${skills.length > 3 ? '...' : ''}`;
    } else if (cv.profile_summary) {
      return cv.profile_summary.substring(0, 100) + (cv.profile_summary.length > 100 ? '...' : '');
    }
    return 'No summary available';
  }
}
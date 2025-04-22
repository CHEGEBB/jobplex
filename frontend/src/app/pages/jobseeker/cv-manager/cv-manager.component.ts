import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CvService, CV, Education, Experience, Language } from '../../../services/cv.service';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPen, faTrash, faStar, faPlus, faTimes, faCheck, faArrowUp, faArrowDown, 
  faGraduationCap, faBriefcase, faGlobe, faCertificate, faLanguage, faTag,
  faSave, faEye, faCopy } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';

@Component({
  selector: 'app-cv-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SidebarComponent,
    FontAwesomeModule
  ],
  templateUrl: './cv-manager.component.html',
  styleUrls: ['./cv-manager.component.scss']
})
export class CvManagerComponent implements OnInit, OnDestroy {
  // Font Awesome icons
  faPen = faPen;
  faTrash = faTrash;
  faStar = faStar;
  faPlus = faPlus;
  faTimes = faTimes;
  faCheck = faCheck;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faGraduationCap = faGraduationCap;
  faBriefcase = faBriefcase;
  faGlobe = faGlobe;
  faCertificate = faCertificate;
  faLanguage = faLanguage;
  faTag = faTag;
  faSave = faSave;
  faEye = faEye;
  faCopy = faCopy;
  faLinkedin = faLinkedin;
  faGithub = faGithub;

  // Component state
  sidebarCollapsed = false;
  cvs: CV[] = [];
  cvForm!: FormGroup;
  isEditMode = false;
  editingCvId?: number;
  isLoading = false;
  selectedAvatar = '';
  notification = { show: false, message: '', isError: false };
  activeTab = 'personal';
  
  // Avatar selection
  avatars = [
    'https://avatar.iran.liara.run/public/boy',
    'https://avatar.iran.liara.run/public/girl',
    'https://avatar.iran.liara.run/public/boy?username=Scott',
    'https://avatar.iran.liara.run/public/girl?username=Maria',
    'https://avatar.iran.liara.run/public/job/doctor/male',
    'https://avatar.iran.liara.run/public/job/doctor/female',
    'https://avatar.iran.liara.run/public/2',
    'https://avatar.iran.liara.run/public'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cvService: CvService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCVs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  initForm(): void {
    this.cvForm = this.fb.group({
      title: ['My CV', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      city: [''],
      country: [''],
      postalCode: [''],
      profileSummary: [''],
      avatarUrl: [''],
      website: [''],
      linkedin: [''],
      github: [''],
      skills: this.fb.array([this.createSkillControl()]),
      education: this.fb.array([]),
      experience: this.fb.array([]),
      projects: this.fb.array([]),
      certifications: this.fb.array([]),
      languages: this.fb.array([]),
      tags: this.fb.array([this.createTagControl()])
    });

    this.selectedAvatar = this.avatars[0];
    this.cvForm.get('avatarUrl')?.setValue(this.selectedAvatar);
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

  // Form array creation methods
  createSkillControl() {
    return this.fb.control('', Validators.required);
  }

  createTagControl() {
    return this.fb.control('');
  }

  createEducationGroup() {
    return this.fb.group({
      institution: ['', Validators.required],
      degree: ['', Validators.required],
      field: [''],
      startDate: [''],
      endDate: [''],
      description: ['']
    });
  }

  createExperienceGroup() {
    return this.fb.group({
      company: ['', Validators.required],
      position: ['', Validators.required],
      location: [''],
      startDate: [''],
      endDate: [''],
      currentlyWorking: [false],
      description: ['']
    });
  }

  createProjectGroup() {
    return this.fb.group({
      name: ['', Validators.required],
      description: [''],
      url: [''],
      technologies: this.fb.array([this.fb.control('')])
    });
  }

  createCertificationGroup() {
    return this.fb.group({
      name: ['', Validators.required],
      issuer: [''],
      date: [''],
      url: ['']
    });
  }

  createLanguageGroup() {
    return this.fb.group({
      language: ['', Validators.required],
      proficiency: ['Beginner']
    });
  }

  // Add items to arrays
  addSkill(): void {
    this.skillsArray.push(this.createSkillControl());
  }

  addEducation(): void {
    this.educationArray.push(this.createEducationGroup());
  }

  addExperience(): void {
    this.experienceArray.push(this.createExperienceGroup());
  }

  addProject(): void {
    this.projectsArray.push(this.createProjectGroup());
  }

  addCertification(): void {
    this.certificationsArray.push(this.createCertificationGroup());
  }

  addLanguage(): void {
    this.languagesArray.push(this.createLanguageGroup());
  }

  addTag(): void {
    this.tagsArray.push(this.createTagControl());
  }

  // Remove items from arrays
  removeSkill(index: number): void {
    this.skillsArray.removeAt(index);
  }

  removeEducation(index: number): void {
    this.educationArray.removeAt(index);
  }

  removeExperience(index: number): void {
    this.experienceArray.removeAt(index);
  }

  removeProject(index: number): void {
    this.projectsArray.removeAt(index);
  }

  removeCertification(index: number): void {
    this.certificationsArray.removeAt(index);
  }

  removeLanguage(index: number): void {
    this.languagesArray.removeAt(index);
  }

  removeTag(index: number): void {
    this.tagsArray.removeAt(index);
  }

  // Select avatar
  selectAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
    this.cvForm.get('avatarUrl')?.setValue(avatar);
  }

  // Load CVs from API
  loadCVs(): void {
    this.isLoading = true;
    this.cvService.getCVs()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data) => {
          this.cvs = data;
        },
        error: (error) => {
          this.showNotification('Error loading CVs: ' + error.message, true);
        }
      });
  }

  // Edit a CV
  editCV(cv: CV): void {
    this.isEditMode = true;
    this.editingCvId = cv.id;
    this.selectedAvatar = cv.avatar_url || this.avatars[0];
    
    // Reset form and populate with CV data
    this.cvForm.reset();
    
    // Set basic fields
    this.cvForm.patchValue({
      title: cv.title,
      firstName: cv.first_name,
      lastName: cv.last_name,
      email: cv.email,
      phone: cv.phone || '',
      address: cv.address || '',
      city: cv.city || '',
      country: cv.country || '',
      postalCode: cv.postal_code || '',
      profileSummary: cv.profile_summary || '',
      avatarUrl: cv.avatar_url || this.selectedAvatar,
      website: cv.website || '',
      linkedin: cv.linkedin || '',
      github: cv.github || ''
    });
    
    // Clear and recreate arrays
    this.clearFormArrays();
    
    // Populate skills
    if (cv.skills && cv.skills.length) {
      this.skillsArray.clear();
      cv.skills.forEach(skill => {
        this.skillsArray.push(this.fb.control(skill));
      });
    }
    
    // Populate education
    if (cv.education && cv.education.length) {
      cv.education.forEach(edu => {
        this.educationArray.push(this.fb.group({
          institution: [edu.institution],
          degree: [edu.degree],
          field: [edu.field || ''],
          startDate: [edu.start_date || ''],
          endDate: [edu.end_date || ''],
          description: [edu.description || '']
        }));
      });
    } else {
      this.addEducation();
    }
    
    // Populate experience
    if (cv.experience && cv.experience.length) {
      cv.experience.forEach(exp => {
        this.experienceArray.push(this.fb.group({
          company: [exp.company],
          position: [exp.position],
          location: [exp.location || ''],
          startDate: [exp.start_date || ''],
          endDate: [exp.end_date || ''],
          currentlyWorking: [exp.current || false],
          description: [exp.description || '']
        }));
      });
    } else {
      this.addExperience();
    }
    
    // Populate tags
    if (cv.tags && cv.tags.length) {
      this.tagsArray.clear();
      cv.tags.forEach(tag => {
        this.tagsArray.push(this.fb.control(tag));
      });
    }
    
    // Populate languages
    if (cv.languages && cv.languages.length) {
      cv.languages.forEach(lang => {
        this.languagesArray.push(this.fb.group({
          language: [lang.name],
          proficiency: [lang.proficiency]
        }));
      });
    } else {
      this.addLanguage();
    }
  }

  // Create a new CV
  createNewCV(): void {
    this.isEditMode = false;
    this.editingCvId = undefined;
    this.selectedAvatar = this.avatars[0];
    this.initForm();
    this.activeTab = 'personal';
  }

  // Clear all form arrays
  clearFormArrays(): void {
    this.skillsArray.clear();
    this.educationArray.clear();
    this.experienceArray.clear();
    this.projectsArray.clear();
    this.certificationsArray.clear();
    this.languagesArray.clear();
    this.tagsArray.clear();
    
    // Add default empty items
    this.addSkill();
    this.addTag();
  }

  // Submit the form
  onSubmit(): void {
    if (this.cvForm.invalid) {
      this.markFormGroupTouched(this.cvForm);
      this.showNotification('Please fix the errors in the form.', true);
      return;
    }
    
    // Clean empty array values
    const formData = this.cleanFormData(this.cvForm.value);
    
    this.isLoading = true;
    
    if (this.isEditMode && this.editingCvId) {
      // Update existing CV
      this.cvService.updateCV(this.editingCvId, formData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: (data) => {
            this.showNotification('CV updated successfully!', false);
            this.loadCVs();
          },
          error: (error) => {
            this.showNotification('Error updating CV: ' + error.message, true);
          }
        });
    } else {
      // Create new CV
      this.cvService.createCV(formData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: (data) => {
            this.showNotification('CV created successfully!', false);
            this.loadCVs();
            this.createNewCV();
          },
          error: (error) => {
            this.showNotification('Error creating CV: ' + error.message, true);
          }
        });
    }
  }

  // Clean form data
  cleanFormData(formData: any): any {
    const cleanData = { ...formData };
    
    // Clean empty skills
    if (cleanData.skills) {
      cleanData.skills = cleanData.skills.filter((s: string) => s.trim() !== '');
    }
    
    // Clean empty tags
    if (cleanData.tags) {
      cleanData.tags = cleanData.tags.filter((t: string) => t.trim() !== '');
    }
    
    return cleanData;
  }

  // Set primary CV
  setPrimaryCV(cv: CV): void {
    this.isLoading = true;
    if (cv.id !== undefined) {
      this.cvService.setPrimaryCV(cv.id)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: (data) => {
            this.showNotification('Primary CV set successfully!', false);
            this.loadCVs();
          },
          error: (error) => {
            this.showNotification('Error setting primary CV: ' + error.message, true);
          }
        });
    } else {
      this.showNotification('Error: CV ID is undefined.', true);
    }
  }

  // Delete CV
  deleteCV(cv: CV): void {
    if (confirm(`Are you sure you want to delete "${cv.title}"?`)) {
      this.isLoading = true;
      if (cv.id !== undefined) {
        this.cvService.deleteCV(cv.id)
              .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.isLoading = false)
              )
              .subscribe({
                next: () => {
                  this.showNotification('CV deleted successfully!', false);
                  this.loadCVs();
                },
                error: (error) => {
                  this.showNotification('Error deleting CV: ' + error.message, true);
                }
              });
      } else {
        this.showNotification('Error: CV ID is undefined.', true);
      }
    }
  }

  // Helper to mark all form controls as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
      
      if (control instanceof FormArray) {
        control.controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            this.markFormGroupTouched(ctrl);
          } else {
            ctrl.markAsTouched();
          }
        });
      }
    });
  }

  // Show notification message
  showNotification(message: string, isError: boolean): void {
    this.notification = { show: true, message, isError };
    
    // Hide notification after 5 seconds
    setTimeout(() => {
      this.notification.show = false;
    }, 5000);
  }

  // Change tab
  changeTab(tab: string): void {
    this.activeTab = tab;
  }

  // Clone a CV
  cloneCV(cv: CV): void {
    const clonedCv = { ...cv };
    
    // Modify the clone to make it a new CV
    delete clonedCv.id;
    clonedCv.title = `Copy of ${clonedCv.title}`;
    clonedCv.is_primary = false;
    
    this.isLoading = true;
    this.cvService.createCV(clonedCv)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data) => {
          this.showNotification('CV cloned successfully!', false);
          this.loadCVs();
        },
        error: (error) => {
          this.showNotification('Error cloning CV: ' + error.message, true);
        }
      });
  }
}
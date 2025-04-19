import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { Skill, SkillService, CreateSkillRequest } from '../../../services/skill.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';

// Extend the Skill interface with level property or create a local interface
interface SkillWithLevel extends Skill {
  level: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  skills: string[];
  github?: string;
  link?: string;
  image: string;
  featured: boolean;
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiry?: string;
  credentialId?: string;
  link?: string;
}

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  imports: [ReactiveFormsModule, CommonModule, SidebarComponent,FormsModule],
  styleUrls: ['./portfolio.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(-20px)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class PortfolioComponent implements OnInit {
  // Tab navigation
  activeTab: 'projects' | 'skills' | 'certificates' = 'projects';
  
  // Skills tab
  activeSkillTab: 'technical' | 'soft' | 'language' | 'tool' = 'technical';
  skills: SkillWithLevel[] = []; // Updated to SkillWithLevel interface
  showAddSkill = false;
  skillForm: FormGroup;
  
  // Projects tab
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  showAddProject = false;
  projectForm: FormGroup;
  activeProjectFilter: string = 'all';
  searchQuery: string = '';
  
  // Certificates tab
  certificates: Certificate[] = [];
  showAddCertificate = false;
  certificateForm: FormGroup;
  
  // UI state
  sidebarCollapsed = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // For getting skill counts by category
  get technicalSkillCount(): number {
    return this.skills.filter(s => this.mapProficiencyToCategory(s.proficiency) === 'technical').length;
  }
  
  get softSkillCount(): number {
    return this.skills.filter(s => this.mapProficiencyToCategory(s.proficiency) === 'soft').length;
  }
  
  get languageSkillCount(): number {
    return this.skills.filter(s => this.mapProficiencyToCategory(s.proficiency) === 'language').length;
  }
  
  get toolSkillCount(): number {
    return this.skills.filter(s => this.mapProficiencyToCategory(s.proficiency) === 'tool').length;
  }
  
  constructor(
    private formBuilder: FormBuilder,
    private skillService: SkillService
  ) {
    // Initialize forms
    this.skillForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      category: ['technical', [Validators.required]],
      level: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      yearsExperience: [null]
    });
    
    this.projectForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      skills: ['', [Validators.required]],
      github: [''],
      link: [''],
      featured: [false]
    });
    
    this.certificateForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      issuer: ['', [Validators.required]],
      date: ['', [Validators.required]],
      expiry: [''],
      credentialId: [''],
      link: ['']
    });
  }
  
  ngOnInit(): void {
    this.loadSkills();
    this.loadProjects();
    this.loadCertificates();
  }
  
  // Navigation methods
  setActiveTab(tab: 'projects' | 'skills' | 'certificates'): void {
    this.activeTab = tab;
  }
  
  setActiveSkillTab(tab: 'technical' | 'soft' | 'language' | 'tool'): void {
    this.activeSkillTab = tab;
  }
  
  onToggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
  
  // Skills methods
  loadSkills(): void {
    this.isLoading = true;
    this.skillService.getMySkills().subscribe({
      next: (data) => {
        // Convert Skill objects to SkillWithLevel objects
        this.skills = data.map(skill => {
          // Calculate level from proficiency
          const level = this.calculateLevelFromProficiency(skill.proficiency);
          return { ...skill, level };
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load skills';
        this.isLoading = false;
      }
    });
  }
  
  // Helper method to calculate level from proficiency string
  calculateLevelFromProficiency(proficiency: string): number {
    switch (proficiency) {
      case 'beginner': return 1;
      case 'intermediate': return 3;
      case 'advanced': return 4;
      case 'expert': return 5;
      default: return 3;
    }
  }
  
  toggleAddSkill(): void {
    this.showAddSkill = !this.showAddSkill;
    if (!this.showAddSkill) {
      this.skillForm.reset({
        category: 'technical',
        level: 3
      });
    }
  }
  
  submitSkill(): void {
    if (this.skillForm.invalid) {
      return;
    }
    
    const formValue = this.skillForm.value;
    
    // Map our form values to the API expected format
    const skillToCreate: CreateSkillRequest = {
      name: formValue.name,
      proficiency: this.mapLevelToProficiency(formValue.level),
      yearsExperience: formValue.yearsExperience || 0
    };
    
    this.isLoading = true;
    this.skillService.createSkill(skillToCreate).subscribe({
      next: (newSkill) => {
        // Add the new skill to our local array with level property
        const skillWithLevel: SkillWithLevel = {
          ...newSkill,
          level: formValue.level
        };
        this.skills.push(skillWithLevel);
        this.isLoading = false;
        this.successMessage = 'Skill added successfully';
        this.toggleAddSkill();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to add skill';
        this.isLoading = false;
      }
    });
  }
  
  deleteSkill(skill: SkillWithLevel): void {
    if (confirm(`Are you sure you want to delete the skill: ${skill.name}?`)) {
      this.isLoading = true;
      this.skillService.deleteSkill(skill.id).subscribe({
        next: () => {
          // Remove from local array
          this.skills = this.skills.filter(s => s.id !== skill.id);
          this.isLoading = false;
          this.successMessage = 'Skill deleted successfully';
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to delete skill';
          this.isLoading = false;
        }
      });
    }
  }
  
  getSkillsByCategory(category: string): SkillWithLevel[] {
    return this.skills.filter(skill => this.mapProficiencyToCategory(skill.proficiency) === category);
  }
  
  // Helper methods for skill display
  mapProficiencyToCategory(proficiency: string): 'technical' | 'soft' | 'language' | 'tool' {
    // This is a simplified mapping - you might want to implement a more sophisticated logic
    // based on your actual data schema
    switch (proficiency) {
      case 'beginner':
      case 'intermediate':
        return 'technical';
      case 'advanced':
        return 'language';
      case 'expert':
        return 'tool';
      default:
        return 'soft';
    }
  }
  
  mapLevelToProficiency(level: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    switch (level) {
      case 1: return 'beginner';
      case 2: return 'beginner';
      case 3: return 'intermediate';
      case 4: return 'advanced';
      case 5: return 'expert';
      default: return 'intermediate';
    }
  }
  
  getSkillLevelText(level: number): string {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Elementary';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Intermediate';
    }
  }
  
  getSkillBarWidth(level: number): string {
    // Convert level (1-5) to percentage
    const percentage = (level / 5) * 100;
    return `${percentage}%`;
  }
  
  // Project methods
  loadProjects(): void {
    // This would normally connect to a project service
    // For now, we'll use mock data
    this.projects = [
      {
        id: '1',
        title: 'Portfolio Website',
        description: 'A personal portfolio website built with Angular and Tailwind CSS to showcase projects and skills.',
        skills: ['Angular', 'TypeScript', 'Tailwind CSS'],
        github: 'https://github.com/username/portfolio',
        link: 'https://portfolio.example.com',
        image: 'https://via.placeholder.com/600x400',
        featured: true
      },
      {
        id: '2',
        title: 'Job Board Application',
        description: 'A full-stack job board application with user authentication, job posting, and application tracking.',
        skills: ['React', 'Node.js', 'Express', 'PostgreSQL'],
        github: 'https://github.com/username/job-board',
        image: 'https://via.placeholder.com/600x400',
        featured: false
      }
    ];
    this.filteredProjects = [...this.projects];
  }
  
  toggleAddProject(): void {
    this.showAddProject = !this.showAddProject;
    if (!this.showAddProject) {
      this.projectForm.reset({
        featured: false
      });
    }
  }
  
  submitProject(): void {
    if (this.projectForm.invalid) {
      return;
    }
    
    const formValue = this.projectForm.value;
    
    // Create a new project
    const newProject: Project = {
      id: Date.now().toString(),
      title: formValue.title,
      description: formValue.description,
      skills: formValue.skills.split(',').map((skill: string) => skill.trim()),
      github: formValue.github,
      link: formValue.link,
      image: 'https://via.placeholder.com/600x400',
      featured: formValue.featured
    };
    
    // Add to local array
    this.projects.push(newProject);
    this.filterProjects(this.activeProjectFilter);
    this.successMessage = 'Project added successfully';
    this.toggleAddProject();
  }
  
  deleteProject(id: string): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projects = this.projects.filter(p => p.id !== id);
      this.filterProjects(this.activeProjectFilter);
      this.successMessage = 'Project deleted successfully';
    }
  }
  
  toggleProjectFeatured(project: Project): void {
    project.featured = !project.featured;
    this.successMessage = project.featured ? 
      'Project marked as featured' : 
      'Project removed from featured';
  }
  
  filterProjects(filter: string): void {
    this.activeProjectFilter = filter;
    
    if (filter === 'all') {
      this.filteredProjects = [...this.projects];
    } else if (filter === 'featured') {
      this.filteredProjects = this.projects.filter(p => p.featured);
    } else {
      // Filter by technology
      this.filteredProjects = this.projects.filter(p => 
        p.skills.some(skill => skill.toLowerCase() === filter.toLowerCase())
      );
    }
    
    // Apply search filter if there's a search query
    if (this.searchQuery) {
      this.applySearchFilter();
    }
  }
  
  searchProjects(event: Event): void {
    this.applySearchFilter();
  }
  
  applySearchFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();
    
    // First apply the active tab filter
    this.filterProjects(this.activeProjectFilter);
    
    // Then apply the search query filter
    if (query) {
      this.filteredProjects = this.filteredProjects.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }
  }
  
  clearSearch(): void {
    this.searchQuery = '';
    this.filterProjects(this.activeProjectFilter);
  }
  
  // Certificate methods
  loadCertificates(): void {
    // This would normally connect to a certificate service
    // For now, we'll use mock data
    this.certificates = [
      {
        id: '1',
        name: 'Angular Developer Certification',
        issuer: 'Google',
        date: '2023-01-15',
        expiry: '2025-01-15',
        credentialId: 'CERT-12345',
        link: 'https://example.com/cert/12345'
      },
      {
        id: '2',
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: '2022-06-10',
        expiry: '2025-06-10',
        credentialId: 'AWS-DEV-98765',
        link: 'https://example.com/cert/98765'
      }
    ];
  }
  
  toggleAddCertificate(): void {
    this.showAddCertificate = !this.showAddCertificate;
    if (!this.showAddCertificate) {
      this.certificateForm.reset();
    }
  }
  
  submitCertificate(): void {
    if (this.certificateForm.invalid) {
      return;
    }
    
    const formValue = this.certificateForm.value;
    
    // Create a new certificate
    const newCertificate: Certificate = {
      id: Date.now().toString(),
      name: formValue.name,
      issuer: formValue.issuer,
      date: formValue.date,
      expiry: formValue.expiry,
      credentialId: formValue.credentialId,
      link: formValue.link
    };
    
    // Add to local array
    this.certificates.push(newCertificate);
    this.successMessage = 'Certificate added successfully';
    this.toggleAddCertificate();
  }
  
  deleteCertificate(id: string): void {
    if (confirm('Are you sure you want to delete this certificate?')) {
      this.certificates = this.certificates.filter(c => c.id !== id);
      this.successMessage = 'Certificate deleted successfully';
    }
  }
  
  isExpired(expiryDate?: string): boolean {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  }
  
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  // Trackers for ngFor
  trackByProjectId(index: number, item: Project): string {
    return item.id;
  }
  
  trackBySkillId(index: number, item: SkillWithLevel): number {
    return item.id;
  }
  
  trackByCertificateId(index: number, item: Certificate): string {
    return item.id;
  }
}
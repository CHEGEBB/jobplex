import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { PortfolioService, Skill, Project, Certificate } from '../../../services/portfolio.service';

interface SkillWithLevel extends Skill {
  level: number;
}

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  imports: [ReactiveFormsModule, CommonModule, SidebarComponent, FormsModule],
  styleUrls: ['./portfolio.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]),
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
  activeTab: 'projects' | 'skills' | 'certificates' = 'projects';
  activeSkillTab: 'technical' | 'soft' | 'language' | 'tool' = 'technical';
  skills: SkillWithLevel[] = [];
  showAddSkill = false;
  skillForm: FormGroup;
  
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  showAddProject = false;
  projectForm: FormGroup;
  activeProjectFilter = 'all';
  searchQuery = '';
  
  certificates: Certificate[] = [];
  showAddCertificate = false;
  certificateForm: FormGroup;
  
  sidebarCollapsed = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

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
    private portfolioService: PortfolioService
  ) {
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
      image: ['https://via.placeholder.com/600x400'],
      featured: [false]
    });

    this.certificateForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      issuer: ['', [Validators.required]],
      date: ['', [Validators.required]],
      expiry: [''],
      credential_id: [''],
      link: ['']
    });
  }

  ngOnInit(): void {
    this.loadSkills();
    this.loadProjects();
    this.loadCertificates();
  }

  setActiveTab(tab: 'projects' | 'skills' | 'certificates'): void {
    this.activeTab = tab;
  }

  setActiveSkillTab(tab: 'technical' | 'soft' | 'language' | 'tool'): void {
    this.activeSkillTab = tab;
  }

  onToggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  // Skills Methods
  loadSkills(): void {
    this.isLoading = true;
    this.portfolioService.getMySkills().subscribe({
      next: (data) => {
        this.skills = data.map(skill => ({
          ...skill,
          level: this.calculateLevelFromProficiency(skill.proficiency)
        }));
        this.isLoading = false;
      },
      error: (error) => this.handleError(error, 'Failed to load skills')
    });
  }

  toggleAddSkill(): void {
    this.showAddSkill = !this.showAddSkill;
    if (!this.showAddSkill) this.resetSkillForm();
  }

  submitSkill(): void {
    if (this.skillForm.invalid) return;

    const formValue = this.skillForm.value;
    const skillData = {
      name: formValue.name,
      proficiency: this.mapLevelToProficiency(formValue.level),
      years_experience: formValue.yearsExperience || 0
    };

    this.isLoading = true;
    this.portfolioService.createSkill(skillData).subscribe({
      next: (newSkill) => {
        this.skills.push({ ...newSkill, level: formValue.level });
        this.isLoading = false;
        this.showSuccess('Skill added successfully');
        this.toggleAddSkill();
      },
      error: (error) => this.handleError(error, 'Failed to add skill')
    });
  }

  deleteSkill(skillId: number): void {
    if (confirm('Are you sure you want to delete this skill?')) {
      this.isLoading = true;
      this.portfolioService.deleteSkill(skillId).subscribe({
        next: () => {
          this.skills = this.skills.filter(s => s.id !== skillId);
          this.isLoading = false;
          this.showSuccess('Skill deleted successfully');
        },
        error: (error) => this.handleError(error, 'Failed to delete skill')
      });
    }
  }

  // Projects Methods
  loadProjects(): void {
    this.isLoading = true;
    this.portfolioService.getMyProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.filteredProjects = [...data];
        this.isLoading = false;
      },
      error: (error) => this.handleError(error, 'Failed to load projects')
    });
  }

  toggleAddProject(): void {
    this.showAddProject = !this.showAddProject;
    if (!this.showAddProject) this.resetProjectForm();
  }

  submitProject(): void {
    if (this.projectForm.invalid) return;

    const formValue = this.projectForm.value;
    const projectData = {
      ...formValue,
      skills: formValue.skills.split(',').map((s: string) => s.trim())
    };

    this.isLoading = true;
    this.portfolioService.createProject(projectData).subscribe({
      next: (newProject) => {
        this.projects.push(newProject);
        this.filterProjects(this.activeProjectFilter);
        this.isLoading = false;
        this.showSuccess('Project added successfully');
        this.toggleAddProject();
      },
      error: (error) => this.handleError(error, 'Failed to add project')
    });
  }

  deleteProject(projectId: number): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.isLoading = true;
      this.portfolioService.deleteProject(projectId).subscribe({
        next: () => {
          this.projects = this.projects.filter(p => p.id !== projectId);
          this.filterProjects(this.activeProjectFilter);
          this.isLoading = false;
          this.showSuccess('Project deleted successfully');
        },
        error: (error) => this.handleError(error, 'Failed to delete project')
      });
    }
  }

  // Certificates Methods
  loadCertificates(): void {
    this.isLoading = true;
    this.portfolioService.getMyCertificates().subscribe({
      next: (data) => {
        this.certificates = data;
        this.isLoading = false;
      },
      error: (error) => this.handleError(error, 'Failed to load certificates')
    });
  }

  toggleAddCertificate(): void {
    this.showAddCertificate = !this.showAddCertificate;
    if (!this.showAddCertificate) this.resetCertificateForm();
  }

  submitCertificate(): void {
    if (this.certificateForm.invalid) return;

    const formValue = this.certificateForm.value;
    this.isLoading = true;
    
    this.portfolioService.createCertificate(formValue).subscribe({
      next: (newCert) => {
        this.certificates.push(newCert);
        this.isLoading = false;
        this.showSuccess('Certificate added successfully');
        this.toggleAddCertificate();
      },
      error: (error) => this.handleError(error, 'Failed to add certificate')
    });
  }

  deleteCertificate(certId: number): void {
    if (confirm('Are you sure you want to delete this certificate?')) {
      this.isLoading = true;
      this.portfolioService.deleteCertificate(certId).subscribe({
        next: () => {
          this.certificates = this.certificates.filter(c => c.id !== certId);
          this.isLoading = false;
          this.showSuccess('Certificate deleted successfully');
        },
        error: (error) => this.handleError(error, 'Failed to delete certificate')
      });
    }
  }

  // Shared Methods
  private resetSkillForm(): void {
    this.skillForm.reset({ category: 'technical', level: 3 });
  }

  private resetProjectForm(): void {
    this.projectForm.reset({ 
      image: 'https://via.placeholder.com/600x400',
      featured: false 
    });
  }

  private resetCertificateForm(): void {
    this.certificateForm.reset();
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }

  private handleError(error: Error, defaultMsg: string): void {
    this.errorMessage = error.message || defaultMsg;
    this.isLoading = false;
    setTimeout(() => this.errorMessage = '', 5000);
  }

  // View Logic Helpers
  calculateLevelFromProficiency(proficiency: string): number {
    switch (proficiency) {
      case 'beginner': return 1;
      case 'intermediate': return 3;
      case 'advanced': return 4;
      case 'expert': return 5;
      default: return 3;
    }
  }

  mapProficiencyToCategory(proficiency: string): string {
    switch (proficiency) {
      case 'beginner':
      case 'intermediate': return 'technical';
      case 'advanced': return 'language';
      case 'expert': return 'tool';
      default: return 'soft';
    }
  }

  mapLevelToProficiency(level: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    switch (level) {
      case 1: case 2: return 'beginner';
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
    return `${(level / 5) * 100}%`;
  }

  filterProjects(filter: string): void {
    this.activeProjectFilter = filter;
    this.filteredProjects = filter === 'all' 
      ? [...this.projects] 
      : filter === 'featured' 
        ? this.projects.filter(p => p.featured)
        : this.projects.filter(p => p.skills.some(s => s.toLowerCase() === filter.toLowerCase()));
    
    if (this.searchQuery) this.applySearchFilter();
  }

  applySearchFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredProjects = this.filteredProjects.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.skills.some(s => s.toLowerCase().includes(query))
    );
  }

  isExpired(expiryDate?: string): boolean {
    return expiryDate ? new Date(expiryDate) < new Date() : false;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // TrackBy Functions
  trackByProjectId(index: number, item: Project): number {
    return item.id;
  }

  trackBySkillId(index: number, item: Skill): number {
    return item.id;
  }

  trackByCertificateId(index: number, item: Certificate): number {
    return item.id;
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClientModule } from '@angular/common/http';
import { SkillService, Skill } from '../../../services/skill.service';
import { finalize, tap } from 'rxjs/operators';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  skills: string[];
  link?: string;
  github?: string;
  featured: boolean;
}

interface Certificate {
  id: number;
  name: string;
  issuer: string;
  date: string;
  expiry?: string;
  credentialId?: string;
  link?: string;
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, SidebarComponent, FormsModule, HttpClientModule],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class PortfolioComponent implements OnInit {
  sidebarCollapsed = false;
  activeTab: 'projects' | 'skills' | 'certificates' = 'projects';
  activeSkillTab: 'technical' | 'soft' | 'language' | 'tool' = 'technical';
  showAddProject = false;
  showAddSkill = false;
  showAddCertificate = false;
  projectForm!: FormGroup;
  skillForm!: FormGroup;
  certificateForm!: FormGroup;
  filteredProjects: Project[] = [];
  searchQuery = '';
  activeProjectFilter = 'all';
  portfolioVisibility = 'public';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  projects: Project[] = [
    {
      id: 1,
      title: 'A responsive dashboard for managing online store operations',
      description: 'An e-commerce analytics platform that provides real-time insights on product performance, customer behavior, and sales trends. The dashboard includes interactive visualizations and actionable recommendations.',
      image: 'assets/eccomerce.png',
      skills: ['React', 'Redux', 'Chart.js'],
      github: 'https://github.com/username/ecommerce-dashboard',
      link: 'https://dashboard-demo.example.com',
      featured: true
    },
    {
      id: 2,
      title: 'Mobile application for connecting professionals',
      description: 'A networking app designed for industry professionals to connect, share ideas, and collaborate on projects. Features include event discovery, messaging, and professional profile management.',
      image: 'assets/app.jpg',
      skills: ['Flutter', 'Firebase', 'Material UI'],
      github: 'https://github.com/username/pro-connect',
      featured: true
    },
    {
      id: 3,
      title: 'Data visualization and analytics dashboard',
      description: 'A comprehensive analytics solution that transforms complex data into intuitive visualizations. Designed for business intelligence needs with customizable widgets and report generation.',
      image: 'assets/data.webp',
      skills: ['Vue.js', 'D3.js', 'Node.js'],
      link: 'https://analytics-viz.example.com',
      featured: true
    }
  ];

  skills: Skill[] = [];
  certificates: Certificate[] = [];

  technicalSkillCount = 0;
  softSkillCount = 0;
  languageSkillCount = 0;
  toolSkillCount = 0;

  constructor(
    private fb: FormBuilder, 
    private skillService: SkillService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.filteredProjects = [...this.projects];
    this.loadUserSkills();
    this.loadUserCertificates();
    
    // Check screen size for responsive sidebar
    this.sidebarCollapsed = window.innerWidth < 768;
  }

  initForms(): void {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      skills: ['', [Validators.required]],
      link: [''],
      github: [''],
      featured: [false]
    });

    this.skillForm = this.fb.group({
      name: ['', [Validators.required]],
      level: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      category: ['technical', [Validators.required]],
      yearsExperience: [null]
    });

    this.certificateForm = this.fb.group({
      name: ['', [Validators.required]],
      issuer: ['', [Validators.required]],
      date: ['', [Validators.required]],
      expiry: [''],
      credentialId: [''],
      link: ['']
    });
  }

  // Skills Methods
  loadUserSkills(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.skillService.getUserSkills()
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (skills) => {
          this.skills = skills;
          this.updateSkillCounts();
          console.log("Skills loaded successfully", skills);
        },
        error: (error) => {
          console.error('Failed to load skills:', error);
          this.errorMessage = 'Failed to load skills. Please try again.';
          this.loadSampleSkills(); // Fallback to sample data
        }
      });
  }

  loadSampleSkills(): void {
    // This is only for fallback when API fails
    this.skills = [
      { name: 'JavaScript', level: 5, category: 'technical', yearsExperience: 4 },
      { name: 'TypeScript', level: 4, category: 'technical', yearsExperience: 3 },
      { name: 'React', level: 5, category: 'technical', yearsExperience: 3 },
      { name: 'Angular', level: 4, category: 'technical', yearsExperience: 2 },
      { name: 'Node.js', level: 4, category: 'technical', yearsExperience: 3 },
      { name: 'MongoDB', level: 3, category: 'technical', yearsExperience: 2 },
      { name: 'SQL', level: 4, category: 'technical', yearsExperience: 3 },
      { name: 'HTML/CSS', level: 5, category: 'technical', yearsExperience: 5 },
      { name: 'Python', level: 3, category: 'technical', yearsExperience: 2 },
      { name: 'Team Leadership', level: 4, category: 'soft', yearsExperience: 2 },
      { name: 'Problem Solving', level: 5, category: 'soft' },
      { name: 'Communication', level: 4, category: 'soft' },
      { name: 'Project Management', level: 3, category: 'soft', yearsExperience: 2 },
      { name: 'English', level: 5, category: 'language' },
      { name: 'Spanish', level: 3, category: 'language' },
      { name: 'Figma', level: 4, category: 'tool', yearsExperience: 2 },
      { name: 'Git', level: 5, category: 'tool', yearsExperience: 4 },
      { name: 'Docker', level: 3, category: 'tool', yearsExperience: 1 },
      { name: 'AWS', level: 3, category: 'tool', yearsExperience: 2 }
    ];
    this.updateSkillCounts();
  }

  updateSkillCounts(): void {
    this.technicalSkillCount = this.skills.filter(s => s.category === 'technical').length;
    this.softSkillCount = this.skills.filter(s => s.category === 'soft').length;
    this.languageSkillCount = this.skills.filter(s => s.category === 'language').length;
    this.toolSkillCount = this.skills.filter(s => s.category === 'tool').length;
  }

  submitSkill(): void {
    if (this.skillForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const newSkill: Skill = {
        name: this.skillForm.value.name,
        level: this.skillForm.value.level,
        category: this.skillForm.value.category,
        yearsExperience: this.skillForm.value.yearsExperience || undefined
      };
      
      console.log('Creating skill with data:', newSkill);
      
      this.skillService.createSkill(newSkill)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (skill) => {
            this.skills.push(skill);
            this.updateSkillCounts();
            this.successMessage = 'Skill added successfully!';
            console.log("Skill added successfully", skill);
            this.toggleAddSkill(); // Only hide the form on success
          },
          error: (error) => {
            console.error('Error adding skill:', error);
            this.errorMessage = 'Failed to add skill: ' + (error.message || 'Unknown error');
            // Don't close the form so user can try again
          }
        });
    }
  }
  deleteSkill(skillToDelete: Skill): void {
    if (confirm('Are you sure you want to delete this skill?')) {
      if (!skillToDelete.id) {
        console.error('Cannot delete skill without ID');
        this.errorMessage = 'Cannot delete skill without ID';
        return;
      }
      
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      this.skillService.removeUserSkill(skillToDelete.id)
        .pipe(
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: () => {
            // Remove skill from local array
            this.skills = this.skills.filter(s => s.id !== skillToDelete.id);
            this.updateSkillCounts();
            this.successMessage = 'Skill removed successfully!';
          },
          error: (error) => {
            console.error('Error removing skill:', error);
            this.errorMessage = error.message || 'Failed to remove skill. Please try again.';
          }
        });
    }
  }

  // Certificates Methods
  loadUserCertificates(): void {
    // When we have certificates endpoint, we can replace this with real API call
    this.certificates = [
      {
        id: 1,
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2024-01-15',
        expiry: '2027-01-15',
        credentialId: 'AWS-SA-12345',
        link: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/'
      },
      {
        id: 2,
        name: 'Professional Scrum Master I',
        issuer: 'Scrum.org',
        date: '2023-08-10',
        credentialId: 'PSM-I-98765',
        link: 'https://www.scrum.org/professional-scrum-certifications/professional-scrum-master-i-certification'
      },
      {
        id: 3,
        name: 'Google UX Design Professional Certificate',
        issuer: 'Google',
        date: '2023-05-22',
        credentialId: 'GUX-54321',
        link: 'https://www.coursera.org/professional-certificates/google-ux-design'
      }
    ];
  }

  submitCertificate(): void {
    if (this.certificateForm.valid) {
      const newCertificate: Certificate = {
        id: this.certificates.length + 1,
        name: this.certificateForm.value.name,
        issuer: this.certificateForm.value.issuer,
        date: this.certificateForm.value.date,
        expiry: this.certificateForm.value.expiry || undefined,
        credentialId: this.certificateForm.value.credentialId || undefined,
        link: this.certificateForm.value.link || undefined
      };
      
      this.certificates.unshift(newCertificate);
      this.toggleAddCertificate();
    }
  }

  deleteCertificate(id: number): void {
    if (confirm('Are you sure you want to delete this certificate?')) {
      this.certificates = this.certificates.filter(c => c.id !== id);
    }
  }

  // Projects Methods
  submitProject(): void {
    if (this.projectForm.valid) {
      const newProject: Project = {
        id: this.projects.length + 1,
        title: this.projectForm.value.title,
        description: this.projectForm.value.description,
        image: 'https://source.unsplash.com/random/800x600/?dashboard,tech',
        skills: this.projectForm.value.skills.split(',').map((s: string) => s.trim()),
        link: this.projectForm.value.link || undefined,
        github: this.projectForm.value.github || undefined,
        featured: this.projectForm.value.featured
      };
      
      this.projects.unshift(newProject);
      this.filteredProjects = [...this.projects];
      this.toggleAddProject();
    }
  }

  deleteProject(id: number): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projects = this.projects.filter(p => p.id !== id);
      this.filteredProjects = [...this.projects];
    }
  }

  // UI Helper Methods
  onToggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  setActiveTab(tab: 'projects' | 'skills' | 'certificates'): void {
    this.activeTab = tab;
  }

  setActiveSkillTab(tab: 'technical' | 'soft' | 'language' | 'tool'): void {
    this.activeSkillTab = tab;
  }

  toggleAddProject(): void {
    this.showAddProject = !this.showAddProject;
    if (!this.showAddProject) {
      this.projectForm.reset();
      this.projectForm.controls['featured'].setValue(false);
    }
  }

  toggleAddSkill(): void {
    this.showAddSkill = !this.showAddSkill;
    if (!this.showAddSkill) {
      this.skillForm.reset();
      this.skillForm.controls['level'].setValue(3);
      this.skillForm.controls['category'].setValue('technical');
    }
  }

  toggleAddCertificate(): void {
    this.showAddCertificate = !this.showAddCertificate;
    if (!this.showAddCertificate) {
      this.certificateForm.reset();
    }
  }

  getSkillBarWidth(level: number): string {
    // Convert the level (1-5) to a percentage width
    return `${level * 20}%`;
  }

  getSkillLevelText(level: number): string {
    const levels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
    return levels[level - 1] || 'Unknown';
  }

  getSkillsByCategory(category: 'technical' | 'soft' | 'language' | 'tool'): Skill[] {
    return this.skills.filter(skill => skill.category === category);
  }

  filterProjects(filter: string): void {
    this.activeProjectFilter = filter;
    
    if (filter === 'all') {
      this.filteredProjects = [...this.projects];
    } else if (filter === 'featured') {
      this.filteredProjects = this.projects.filter(p => p.featured);
    } else {
      this.filteredProjects = this.projects.filter(p => 
        p.skills.some(skill => skill.toLowerCase().includes(filter.toLowerCase()))
      );
    }
  }

  searchProjects(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    
    if (this.searchQuery.trim() === '') {
      this.filterProjects(this.activeProjectFilter);
      return;
    }
    
    this.filteredProjects = this.projects.filter(p => 
      p.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      p.skills.some(skill => skill.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredProjects = [...this.projects];
  }

  toggleProjectFeatured(project: Project): void {
    project.featured = !project.featured;
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  
  isExpired(expiryDate?: string): boolean {
    if (!expiryDate) return false;
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    
    return today > expiry;
  }
  
  trackByProjectId(index: number, project: Project): number {
    return project.id;
  }
  
  trackBySkillId(index: number, skill: Skill): number | string {
    return skill.id || skill.name;
  }
  
  trackByCertificateId(index: number, certificate: Certificate): number {
    return certificate.id;
  }
}
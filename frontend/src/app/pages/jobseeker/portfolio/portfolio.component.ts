import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { FilterPipe } from '../../../pipes/filter.pipe';

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

interface Skill {
  name: string;
  level: number; // 1-5
  category: 'technical' | 'soft' | 'language' | 'tool';
  yearsExperience?: number;
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
  imports: [CommonModule, RouterModule, ReactiveFormsModule, SidebarComponent, FormsModule, FilterPipe],
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
    },
    {
      id: 4,
      title: 'A complete e-commerce dashboard with analytics and inventory management',
      description: 'A full-featured dashboard for online retailers that combines inventory management, order processing, customer data, and business analytics in one unified interface.',
      image: 'assets/dash.webp',
      skills: ['Angular', 'NgRx', 'Express', 'MongoDB'],
      github: 'https://github.com/username/commerce-central',
      featured: true
    },
    {
      id: 5,
      title: 'Mobile application for tracking workouts and nutrition plans',
      description: 'A fitness tracking application that allows users to monitor workouts, track nutrition, and follow personalized fitness plans. Includes progress visualization and social sharing features.',
      image: 'assets/work.jpg',
      skills: ['React Native', 'GraphQL', 'AWS'],
      github: 'https://github.com/username/fitness-tracker',
      featured: true
    },
    {
      id:6,
      title: 'A web application for managing personal finances',
      description: 'A personal finance management tool that helps users track expenses, set budgets, and analyze spending habits. Features include visual reports and financial goal setting.',
      image: 'assets/expe.png',
      skills: ['React', 'Redux', 'Chart.js'],
      github:'https://github.com/username/finance-tracker',
      featured: true
    }
  ];

  skills: Skill[] = [
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

  certificates: Certificate[] = [
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

  technicalSkillCount = 0;
  softSkillCount = 0;
  languageSkillCount = 0;
  toolSkillCount = 0;

  constructor(private fb: FormBuilder) {
    this.initForms();
  }

  ngOnInit(): void {
    this.filteredProjects = [...this.projects];
    this.updateSkillCounts();
    
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

  updateSkillCounts(): void {
    this.technicalSkillCount = this.skills.filter(s => s.category === 'technical').length;
    this.softSkillCount = this.skills.filter(s => s.category === 'soft').length;
    this.languageSkillCount = this.skills.filter(s => s.category === 'language').length;
    this.toolSkillCount = this.skills.filter(s => s.category === 'tool').length;
  }

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
  getSkillBarWidth(level: number): string {
    // Convert the level (1-5) to a percentage width
    return `${level * 20}%`;
  }
  clearSearch() {
    this.searchQuery = '';
    // Add any additional logic needed when clearing the search
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

  submitSkill(): void {
    if (this.skillForm.valid) {
      const newSkill: Skill = {
        name: this.skillForm.value.name,
        level: this.skillForm.value.level,
        category: this.skillForm.value.category,
        yearsExperience: this.skillForm.value.yearsExperience || undefined
      };
      
      this.skills.push(newSkill);
      this.updateSkillCounts();
      this.toggleAddSkill();
    }
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

  deleteProject(id: number): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projects = this.projects.filter(p => p.id !== id);
      this.filteredProjects = [...this.projects];
    }
  }

  deleteSkill(skillToDelete: Skill): void {
    if (confirm('Are you sure you want to delete this skill?')) {
      this.skills = this.skills.filter(s => s.name !== skillToDelete.name);
      this.updateSkillCounts();
    }
  }

  deleteCertificate(id: number): void {
    if (confirm('Are you sure you want to delete this certificate?')) {
      this.certificates = this.certificates.filter(c => c.id !== id);
    }
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

  getSkillLevelText(level: number): string {
    const levels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
    return levels[level - 1] || 'Unknown';
  }

  toggleProjectFeatured(project: Project): void {
    project.featured = !project.featured;
  }

  exportPortfolio(): void {
    const portfolioData = {
      projects: this.projects,
      skills: this.skills,
      certificates: this.certificates
    };
    
    const dataStr = JSON.stringify(portfolioData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'portfolio-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
  
  importPortfolio(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        try {
          const importedData = JSON.parse(e.target.result);
          
          if (importedData.projects && Array.isArray(importedData.projects)) {
            this.projects = importedData.projects;
            this.filteredProjects = [...this.projects];
          }
          
          if (importedData.skills && Array.isArray(importedData.skills)) {
            this.skills = importedData.skills;
            this.updateSkillCounts();
          }
          
          if (importedData.certificates && Array.isArray(importedData.certificates)) {
            this.certificates = importedData.certificates;
          }
          
          alert('Portfolio data imported successfully!');
        } catch (error) {
          console.error('Error importing portfolio data:', error);
          alert('Failed to import portfolio data. Please check the file format.');
        }
      };
      
      reader.readAsText(fileInput.files[0]);
    }
  }
  
  setPortfolioVisibility(visibility: 'public' | 'private' | 'unlisted'): void {
    this.portfolioVisibility = visibility;
    // In a real app, this would update the backend/database
  }
  
  generateShareableLink(): string {
    // In a real app, this would generate a proper sharing link
    return `https://example.com/portfolio/${this.portfolioVisibility === 'unlisted' ? 'share/unique-id-123' : 'username'}`;
  }
  
  sortProjectsByDate(): void {
    // Assuming we add a date field to projects in the future
    // For now, just reverse the order as a placeholder
    this.projects.reverse();
    this.filteredProjects = [...this.projects];
  }
  
  sortProjectsByTitle(): void {
    this.projects.sort((a, b) => a.title.localeCompare(b.title));
    this.filteredProjects = [...this.projects];
  }
  
  getSkillsByCategory(category: 'technical' | 'soft' | 'language' | 'tool'): Skill[] {
    return this.skills.filter(skill => skill.category === category);
  }
  
  getTotalExperienceYears(): number {
    const technicalSkills = this.skills.filter(s => s.category === 'technical' && s.yearsExperience);
    if (technicalSkills.length === 0) return 0;
    
    const maxYears = Math.max(...technicalSkills.map(s => s.yearsExperience || 0));
    return maxYears;
  }
  
  getAverageSkillLevel(category: 'technical' | 'soft' | 'language' | 'tool'): number {
    const categorySkills = this.skills.filter(s => s.category === category);
    if (categorySkills.length === 0) return 0;
    
    const sum = categorySkills.reduce((acc, skill) => acc + skill.level, 0);
    return Math.round((sum / categorySkills.length) * 10) / 10; // Round to 1 decimal place
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
  
  trackBySkillName(index: number, skill: Skill): string {
    return skill.name;
  }
  
  trackByCertificateId(index: number, certificate: Certificate): number {
    return certificate.id;
  }
}
import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SidebarEmployerComponent } from '../../../components/sidebar-employer/sidebar-employer.component';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  status: 'active' | 'draft' | 'closed' | 'archived';
  skills: string[];
  description: string;
  postDate: string;
  views: number;
  applications: number;
  matches: number;
  department?: string;
  workMode?: string;
  experienceLevel?: string;
}

@Component({
  selector: 'app-job-posts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarEmployerComponent,
    FontAwesomeModule
  ],
  templateUrl: './job-posts.component.html',
  styleUrls: ['./job-posts.component.scss']
})
export class JobPostsComponent implements OnInit {
  // References for DOM manipulation
  @ViewChild('jobFormContainer') jobFormContainer!: ElementRef;

  // Form controls
  jobForm!: FormGroup;
  skillInput = new FormControl('');
  selectedSkills: string[] = [];
  popularSkills: string[] = [
    'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue.js',
    'Node.js', 'Express', 'MongoDB', 'SQL', 'Python',
    'Java', 'C#', '.NET', 'AWS', 'Docker',
    'Kubernetes', 'CI/CD', 'DevOps', 'Agile', 'Scrum'
  ];

  // UI state
  showJobForm = false;
  editMode = false;
  activeTab = 'basic';
  searchTerm = '';
  statusFilter: string = 'all';
  highlightedJobId: number | null = null;
  highlightActive = false;

  // Demo data
  jobs: Job[] = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'New York, NY',
      salary: '$80,000 - $100,000',
      type: 'Full-time',
      status: 'active',
      skills: ['JavaScript', 'React', 'CSS', 'HTML5'],
      description: 'Looking for an experienced frontend developer to join our team.',
      postDate: '2025-04-01',
      views: 245,
      applications: 18,
      matches: 7,
      department: 'Engineering',
      workMode: 'Hybrid',
      experienceLevel: 'Mid-level'
    },
    {
      id: 2,
      title: 'Backend Engineer',
      company: 'TechCorp',
      location: 'Remote',
      salary: '$90,000 - $120,000',
      type: 'Full-time',
      status: 'active',
      skills: ['Node.js', 'Express', 'MongoDB', 'AWS'],
      description: 'Seeking a backend engineer with experience in Node.js and cloud services.',
      postDate: '2025-03-28',
      views: 189,
      applications: 12,
      matches: 5,
      department: 'Engineering',
      workMode: 'Remote',
      experienceLevel: 'Senior'
    },
    {
      id: 3,
      title: 'UX/UI Designer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: '$75,000 - $95,000',
      type: 'Full-time',
      status: 'draft',
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
      description: 'Join our design team to create beautiful and intuitive user experiences.',
      postDate: 'Not published',
      views: 0,
      applications: 0,
      matches: 0,
      department: 'Design',
      workMode: 'On-site',
      experienceLevel: 'Mid-level'
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      company: 'TechCorp',
      location: 'Chicago, IL',
      salary: '$100,000 - $130,000',
      type: 'Full-time',
      status: 'closed',
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform'],
      description: 'Looking for a DevOps engineer to improve our deployment pipeline.',
      postDate: '2025-02-15',
      views: 210,
      applications: 15,
      matches: 6,
      department: 'Engineering',
      workMode: 'Hybrid',
      experienceLevel: 'Senior'
    }
  ];

  jobStats = {
    active: 2,
    applications: 45,
    matched: 18,
    interviews: 7
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  // Form initialization
  initializeForm(): void {
    this.jobForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      department: [''],
      jobType: ['', Validators.required],
      location: ['', Validators.required],
      workMode: ['On-site'],
      minSalary: [''],
      maxSalary: [''],
      salaryVisible: [true],
      description: ['', Validators.required],
      requirements: ['', Validators.required],
      benefits: [''],
      experienceLevel: ['Mid-level'],
      educationLevel: ['Bachelor\'s'],
      skills: [[], Validators.required],
      deadlineDate: [''],
      internal: [true],
      careerSite: [true],
      linkedin: [false],
      indeed: [false],
      teamAccess: ['all'],
      status: ['draft'],
      scheduledDate: [null],
      notifyNewApplications: [true],
      notifyTopMatches: [true],
      screeningQuestions: this.fb.array([])
    });
  }

  // Getters for form controls
  get screeningQuestions(): FormArray {
    return this.jobForm.get('screeningQuestions') as FormArray;
  }

  // Job filtering
  get filteredJobs(): Job[] {
    return this.jobs.filter(job => {
      // Filter by search term
      const matchesSearch = job.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           job.skills.some(skill => skill.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      // Filter by status
      const matchesStatus = this.statusFilter === 'all' || job.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  // Form actions
  toggleJobForm(): void {
    this.showJobForm = !this.showJobForm;
    if (this.showJobForm) {
      this.activeTab = 'basic';
      if (!this.editMode) {
        this.initializeForm();
        this.selectedSkills = [];
      }
    }
  }

  @HostListener('document:mousedown', ['$event'])
  closeJobFormIfClickedOutside(event: MouseEvent): void {
    if (this.showJobForm && 
        this.jobFormContainer && 
        !this.jobFormContainer.nativeElement.contains(event.target as Node)) {
      this.toggleJobForm();
    }
  }

  editJob(job: Job): void {
    this.editMode = true;
    this.jobForm.patchValue({
      id: job.id,
      title: job.title,
      department: job.department || '',
      jobType: job.type,
      location: job.location,
      workMode: job.workMode || 'On-site',
      experienceLevel: job.experienceLevel || 'Mid-level',
      status: job.status
    });

    // Parse salary range
    if (job.salary) {
      const salaryMatch = job.salary.match(/\$(\d+,?\d*) - \$(\d+,?\d*)/);
      if (salaryMatch) {
        const minSalary = salaryMatch[1].replace(',', '');
        const maxSalary = salaryMatch[2].replace(',', '');
        this.jobForm.patchValue({
          minSalary: minSalary,
          maxSalary: maxSalary
        });
      }
    }

    this.selectedSkills = [...job.skills];
    this.jobForm.get('skills')?.setValue(this.selectedSkills);
    
    this.showJobForm = true;
  }

  saveJob(): void {
    if (this.jobForm.invalid) {
      // Mark all fields as touched to trigger validation
      Object.keys(this.jobForm.controls).forEach(key => {
        const control = this.jobForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formValue = this.jobForm.value;
    
    // Format salary range
    let salary = '';
    if (formValue.minSalary && formValue.maxSalary) {
      salary = `$${formValue.minSalary} - $${formValue.maxSalary}`;
    }

    const jobData: Partial<Job> = {
      title: formValue.title,
      company: 'TechCorp', // Assuming this is the logged-in company
      location: formValue.location,
      salary: salary,
      type: formValue.jobType,
      status: formValue.status,
      skills: this.selectedSkills,
      description: formValue.description,
      department: formValue.department,
      workMode: formValue.workMode,
      experienceLevel: formValue.experienceLevel
    };

    if (this.editMode && formValue.id) {
      // Update existing job
      const index = this.jobs.findIndex(job => job.id === formValue.id);
      if (index !== -1) {
        this.jobs[index] = { ...this.jobs[index], ...jobData } as Job;
        this.highlightedJobId = formValue.id;
        setTimeout(() => {
          this.highlightedJobId = null;
        }, 2000);
      }
    } else {
      // Create new job
      const newJob: Job = {
        id: this.generateJobId(),
        postDate: formValue.status === 'active' ? new Date().toISOString().split('T')[0] : 'Not published',
        views: 0,
        applications: 0,
        matches: 0,
        ...jobData
      } as Job;
      
      this.jobs.unshift(newJob);
      this.highlightedJobId = newJob.id;
      
      // Update stats if job is active
      if (newJob.status === 'active') {
        this.jobStats.active += 1;
        this.highlightActive = true;
        setTimeout(() => {
          this.highlightActive = false;
        }, 2000);
      }
      
      setTimeout(() => {
        this.highlightedJobId = null;
      }, 2000);
    }

    this.toggleJobForm();
    this.editMode = false;
  }

  saveAsDraft(): void {
    this.jobForm.get('status')?.setValue('draft');
    this.saveJob();
  }

  // Job actions
  viewJob(jobId: number): void {
    // In a real app, this would navigate to a detailed view
    console.log('Viewing job', jobId);
  }

  duplicateJob(job: Job): void {
    const newJob: Job = {
      ...job,
      id: this.generateJobId(),
      title: `${job.title} (Copy)`,
      status: 'draft',
      postDate: 'Not published',
      views: 0,
      applications: 0,
      matches: 0
    };
    
    this.jobs.unshift(newJob);
    this.highlightedJobId = newJob.id;
    setTimeout(() => {
      this.highlightedJobId = null;
    }, 2000);
  }

  toggleJobStatus(job: Job): void {
    if (job.status === 'active') {
      job.status = 'closed';
      this.jobStats.active -= 1;
    } else if (job.status === 'closed') {
      job.status = 'active';
      this.jobStats.active += 1;
    }
  }

  archiveJob(jobId: number): void {
    const index = this.jobs.findIndex(job => job.id === jobId);
    if (index !== -1) {
      if (this.jobs[index].status === 'active') {
        this.jobStats.active -= 1;
      }
      this.jobs[index].status = 'archived';
    }
  }

  // Skills management
  addSkill(event: Event): void {
    event.preventDefault();
    const skill = this.skillInput.value?.trim();
    
    if (skill && !this.selectedSkills.includes(skill)) {
      this.selectedSkills.push(skill);
      this.jobForm.get('skills')?.setValue(this.selectedSkills);
      this.skillInput.setValue('');
    }
  }

  removeSkill(index: number): void {
    this.selectedSkills.splice(index, 1);
    this.jobForm.get('skills')?.setValue(this.selectedSkills);
  }

  addPopularSkill(skill: string): void {
    if (!this.selectedSkills.includes(skill)) {
      this.selectedSkills.push(skill);
      this.jobForm.get('skills')?.setValue(this.selectedSkills);
    }
  }

  // Screening questions
  addScreeningQuestion(): void {
    this.screeningQuestions.push(this.fb.group({
      question: ['', Validators.required],
      type: ['text'],
      options: [''],
      required: [false]
    }));
  }

  removeScreeningQuestion(index: number): void {
    this.screeningQuestions.removeAt(index);
  }

  // Form navigation
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  goToNextTab(): void {
    const tabs = ['basic', 'details', 'skills', 'publish'];
    const currentIndex = tabs.indexOf(this.activeTab);
    if (currentIndex < tabs.length - 1) {
      this.activeTab = tabs[currentIndex + 1];
    }
  }

  goToPreviousTab(): void {
    const tabs = ['basic', 'details', 'skills', 'publish'];
    const currentIndex = tabs.indexOf(this.activeTab);
    if (currentIndex > 0) {
      this.activeTab = tabs[currentIndex - 1];
    }
  }

  // Rich text formatting (simplified implementation)
  formatText(format: string): void {
    console.log('Formatting text:', format);
    // In a real app, this would apply formatting to the text
  }

  // Filter management
  setStatusFilter(status: string): void {
    this.statusFilter = status;
  }

  getEmptyStateMessage(): string {
    if (this.searchTerm) {
      return `No job posts match your search "${this.searchTerm}". Try different keywords.`;
    } else if (this.statusFilter !== 'all') {
      return `No ${this.statusFilter} job posts found.`;
    } else {
      return 'You have not created any job posts yet.';
    }
  }

  // Utility functions
  private generateJobId(): number {
    return Math.max(0, ...this.jobs.map(job => job.id)) + 1;
  }
}
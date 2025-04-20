import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SidebarEmployerComponent } from '../../../components/sidebar-employer/sidebar-employer.component';
import { JobService, Job, JobStats } from '../../../services/job.service';
import { Subscription } from 'rxjs';

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
export class JobPostsComponent implements OnInit, OnDestroy {
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
  isLoading = false;
  error = '';

  // Data
  jobs: Job[] = [];
  jobStats: JobStats = {
    active: 0,
    applications: 0,
    matched: 0,
    interviews: 0
  };
  
  // Subscriptions
  private jobSubscription?: Subscription;
  private statsSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadJobs();
    this.statsSubscription = this.jobService.jobStats$.subscribe(stats => {
      this.jobStats = stats;
    });
  }
  
  ngOnDestroy(): void {
    if (this.jobSubscription) {
      this.jobSubscription.unsubscribe();
    }
    if (this.statsSubscription) {
      this.statsSubscription.unsubscribe();
    }
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
                           job.skills.some(skill => 
                             typeof skill === 'string' 
                               ? skill.toLowerCase().includes(this.searchTerm.toLowerCase())
                               : skill.skillName.toLowerCase().includes(this.searchTerm.toLowerCase())
                            );
      
      // Filter by status
      const matchesStatus = this.statusFilter === 'all' || job.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  // Load jobs from service
  loadJobs(): void {
    this.isLoading = true;
    this.error = '';
    
    this.jobSubscription = this.jobService.getEmployerJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading jobs:', err);
        this.error = 'Failed to load jobs. Please try again.';
        this.isLoading = false;
      }
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
    
    // Extract skills as strings
    const skillStrings = job.skills.map(skill => 
      typeof skill === 'string' ? skill : skill.skillName
    );
    
    this.jobForm.patchValue({
      id: job.id,
      title: job.title,
      department: job.department || '',
      jobType: job.type,  // Map job.type to jobType field
      location: job.location,
      workMode: job.workMode || 'On-site',
      experienceLevel: job.experienceLevel || 'Mid-level',
      educationLevel: job.educationLevel || 'Bachelor\'s',
      description: job.description || '',
      requirements: job.requirements || '',
      benefits: job.benefits || '',
      status: job.status,
      deadlineDate: job.deadlineDate || '',
      internal: job.internal !== undefined ? job.internal : true,
      careerSite: job.careerSite !== undefined ? job.careerSite : true,
      linkedin: job.linkedin || false,
      indeed: job.indeed || false,
      teamAccess: job.teamAccess || 'all',
      salaryVisible: job.salaryVisible !== undefined ? job.salaryVisible : true
    });

    // Parse salary range
    if (job.minSalary && job.maxSalary) {
      this.jobForm.patchValue({
        minSalary: job.minSalary,
        maxSalary: job.maxSalary
      });
    } else if (job.salary) {
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

    this.selectedSkills = [...skillStrings];
    this.jobForm.get('skills')?.setValue(this.selectedSkills);
    
    // Handle screening questions if available
    if (job.screeningQuestions && job.screeningQuestions.length > 0) {
      this.screeningQuestions.clear();
      
      job.screeningQuestions.forEach(question => {
        this.screeningQuestions.push(this.fb.group({
          question: [question.question, Validators.required],
          type: [question.type || 'text'],
          options: [question.options ? question.options.join('\n') : ''],
          required: [question.required || false]
        }));
      });
    }
    
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
    this.isLoading = true;
    
    if (this.editMode && formValue.id) {
      // Update existing job
      this.jobService.updateJob(formValue.id, formValue).subscribe({
        next: (updatedJob) => {
          const index = this.jobs.findIndex(job => job.id === formValue.id);
          if (index !== -1) {
            this.jobs[index] = updatedJob;
          }
          this.highlightedJobId = formValue.id;
          setTimeout(() => {
            this.highlightedJobId = null;
          }, 2000);
          this.isLoading = false;
          this.toggleJobForm();
        },
        error: (err) => {
          console.error('Error updating job:', err);
          this.error = 'Failed to update job. Please try again.';
          this.isLoading = false;
        }
      });
    } else {
      // Create new job
      this.jobService.createJob(formValue).subscribe({
        next: (newJob) => {
          this.jobs.unshift(newJob);
          this.highlightedJobId = newJob.id;
          
          // Update stats if job is active
          if (newJob.status === 'active') {
            this.highlightActive = true;
            setTimeout(() => {
              this.highlightActive = false;
            }, 2000);
          }
          
          setTimeout(() => {
            this.highlightedJobId = null;
          }, 2000);
          
          this.isLoading = false;
          this.toggleJobForm();
        },
        error: (err) => {
          console.error('Error creating job:', err);
          this.error = 'Failed to create job. Please try again.';
          this.isLoading = false;
        }
      });
    }
    
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
    const jobCopy = {...job};
    delete (jobCopy as Partial<Job>).id;
    jobCopy.title = `${job.title} (Copy)`;
    jobCopy.status = 'draft';
    
    // The fix: Map the type property to jobType for the CreateJobRequest interface
    const jobRequest = {
      ...jobCopy,
      jobType: job.type, // This is the critical change - ensure jobType is properly set
    };
    
    this.isLoading = true;
    // Transform skills to match the expected JobSkill[] type
    const transformedJobRequest = {
      ...jobRequest,
      skills: jobRequest.skills.map(skill => 
        typeof skill === 'string' 
          ? { skillName: skill, importance: 'required' as 'required' } // Explicitly type importance
          : { ...skill, importance: skill.importance as 'required' | 'preferred' | 'nice-to-have' } // Ensure correct typing
      )
    };

    this.jobService.createJob(transformedJobRequest).subscribe({
      next: (newJob) => {
        this.jobs.unshift(newJob);
        this.highlightedJobId = newJob.id;
        setTimeout(() => {
          this.highlightedJobId = null;
        }, 2000);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error duplicating job:', err);
        this.error = 'Failed to duplicate job. Please try again.';
        this.isLoading = false;
      }
    });
  }

  toggleJobStatus(job: Job): void {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    
    this.jobService.updateJobStatus(job.id, newStatus).subscribe({
      next: (updatedJob) => {
        const index = this.jobs.findIndex(j => j.id === job.id);
        if (index !== -1) {
          this.jobs[index].status = updatedJob.status;
        }
      },
      error: (err) => {
        console.error('Error updating job status:', err);
        this.error = 'Failed to update job status. Please try again.';
      }
    });
  }

  archiveJob(jobId: number): void {
    this.jobService.updateJobStatus(jobId, 'archived').subscribe({
      next: (updatedJob) => {
        const index = this.jobs.findIndex(job => job.id === jobId);
        if (index !== -1) {
          this.jobs[index].status = 'archived';
        }
      },
      error: (err) => {
        console.error('Error archiving job:', err);
        this.error = 'Failed to archive job. Please try again.';
      }
    });
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
  getJobSkills(job: Job): any[] {
    if (!job.skills) {
      return [];
    }
    return Array.isArray(job.skills) ? job.skills : [];
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
}
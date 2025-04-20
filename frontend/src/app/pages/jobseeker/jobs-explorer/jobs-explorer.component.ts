// jobs-explorer.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { JobService, Job as ServiceJob } from '../../../services/job.service';
import { AuthService } from '../../../services/auth.service';
import { finalize } from 'rxjs/operators';

interface Job {
  id: number;
  title: string;
  company: string;
  companyLogo?: string;
  jobType: string;
  locationType: string;
  salaryRange: string;
  postedDate: string;
  matchScore: number;
  isSaved: boolean;
  isApplied: boolean;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  location?: string;
  applicationCount?: number;
}

interface FilterOptions {
  jobType: string[];
  locationType: string[];
  salaryRange: string[];
  experienceLevel: string[];
}

@Component({
  selector: 'app-jobs-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './jobs-explorer.component.html',
  styleUrls: ['./jobs-explorer.component.scss']
})
export class JobsExplorerComponent implements OnInit {
  sidebarCollapsed = false;
  searchQuery = '';
  currentTab = 'recommended';
  selectedJob: Job | null = null;
  loading = false;
  userSkills: string[] = [];
  
  // Filter states
  activeFilters: {[key: string]: string} = {};
  showFilterDropdown: {[key: string]: boolean} = {
    jobType: false,
    locationType: false,
    salaryRange: false,
    sort: false
  };
  
  sortOptions: string[] = ['Match Score', 'Date Posted', 'Salary: High to Low', 'Salary: Low to High'];
  currentSort = 'Match Score';
  
  filterOptions: FilterOptions = {
    jobType: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    locationType: ['Remote', 'Hybrid', 'Onsite'],
    salaryRange: ['$30k-50k', '$50k-80k', '$80k-120k', '$120k-150k', '$150k+'],
    experienceLevel: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive']
  };
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  jobsPerPage = 6;
  totalJobs = 0;
  
  // Jobs data
  allJobs: Job[] = [];
  matchedJobs: Job[] = [];
  savedJobs: Job[] = [];
  appliedJobs: Job[] = [];
  filteredJobs: Job[] = [];
  displayedJobs: Job[] = [];

  constructor(
    private jobService: JobService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.loadJobMatches();
  }

  loadJobMatches(): void {
    this.jobService.getJobMatches()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.userSkills = response.userSkills || [];
          this.allJobs = this.transformJobs(response.matches);
          this.matchedJobs = [...this.allJobs];
          this.filteredJobs = [...this.matchedJobs];
          this.totalJobs = response.totalMatches || this.allJobs.length;
          this.totalPages = Math.ceil(this.totalJobs / this.jobsPerPage);
          
          // Load saved and applied jobs
          this.loadSavedJobs();
          this.loadAppliedJobs();
          
          this.updateDisplayedJobs();
        },
        error: (error) => {
          console.error('Error loading job matches:', error);
          this.allJobs = [];
          this.matchedJobs = [];
          this.filteredJobs = [];
          this.updateDisplayedJobs();
        }
      });
  }

  loadAllJobs(): void {
    this.loading = true;
    this.jobService.getJobs()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          const jobs = this.transformJobs(response.jobs);
          this.allJobs = jobs;
          this.matchedJobs = [...jobs];
          this.filteredJobs = [...this.matchedJobs];
          this.totalJobs = response.pagination.total || this.allJobs.length;
          this.totalPages = Math.ceil(this.totalJobs / this.jobsPerPage);
          this.updateDisplayedJobs();
        },
        error: (error) => {
          console.error('Error loading all jobs:', error);
          this.allJobs = [];
          this.matchedJobs = [];
          this.filteredJobs = [];
          this.updateDisplayedJobs();
        }
      });
  }

  loadSavedJobs(): void {
    // In a real app, you would fetch saved jobs from API
    // For now, we'll just mark some jobs as saved based on localStorage
    const savedJobIds = this.getSavedJobIds();
    this.allJobs.forEach(job => {
      if (savedJobIds.includes(job.id)) {
        job.isSaved = true;
      }
    });
    
    this.savedJobs = this.allJobs.filter(job => job.isSaved);
  }

  loadAppliedJobs(): void {
    // In a real app, you would fetch applied jobs from API
    // For now, we'll just mark some jobs as applied based on localStorage
    const appliedJobIds = this.getAppliedJobIds();
    this.allJobs.forEach(job => {
      if (appliedJobIds.includes(job.id)) {
        job.isApplied = true;
      }
    });
    
    this.appliedJobs = this.allJobs.filter(job => job.isApplied);
  }

  getSavedJobIds(): number[] {
    const savedJobs = localStorage.getItem('savedJobs');
    return savedJobs ? JSON.parse(savedJobs) : [];
  }

  getAppliedJobIds(): number[] {
    const appliedJobs = localStorage.getItem('appliedJobs');
    return appliedJobs ? JSON.parse(appliedJobs) : [];
  }

  transformJobs(serviceJobs: ServiceJob[]): Job[] {
    return serviceJobs.map(job => {
      // Calculate match score based on user skills and job skills
      const matchScore = this.calculateMatchScore(job);
      
      // Parse benefits and requirements into arrays
      const requirements = job.requirements ? 
        job.requirements.split('\n').filter(line => line.trim().length > 0) : [];
      
      const benefits = job.benefits ? 
        job.benefits.split('\n').filter(line => line.trim().length > 0) : [];
        
      // Create responsibilities from description if not available
      const responsibilities = job.description ? 
        job.description.split('\n').filter(line => line.trim().length > 0).slice(0, 5) : [];
        
      return {
        id: job.id,
        title: job.title,
        company: job.company || 'Company Name',
        companyLogo: undefined, // You can set default logo or map from company name
        jobType: job.type || 'Full-time',
        locationType: job.workMode || 'On-site',
        salaryRange: job.salary || 'Competitive',
        postedDate: `Posted ${this.getDaysAgo(job.postDate)} ago`,
        matchScore: matchScore,
        isSaved: false, // Will be updated in loadSavedJobs
        isApplied: false, // Will be updated in loadAppliedJobs
        description: job.description,
        responsibilities: responsibilities,
        requirements: requirements,
        benefits: benefits,
        location: job.location,
        applicationCount: job.applications || 0
      };
    });
  }

  calculateMatchScore(job: ServiceJob): number {
    if (!job.skills || !this.userSkills || this.userSkills.length === 0) {
      return 50; // Default score if we can't calculate
    }
    
    const jobSkills = Array.isArray(job.skills) ? 
      job.skills.map(skill => typeof skill === 'string' ? skill.toLowerCase() : skill.toString().toLowerCase()) : 
      [];
    
    const userSkillsLower = this.userSkills.map(skill => skill.toLowerCase());
    
    // Count matching skills
    let matches = 0;
    for (const skill of userSkillsLower) {
      if (jobSkills.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))) {
        matches++;
      }
    }
    
    // Calculate percentage but ensure it's at least 30%
    const baseScore = 30;
    const maxAdditionalScore = 70;
    
    if (jobSkills.length === 0) return baseScore;
    
    const matchPercentage = Math.min(matches / jobSkills.length, 1);
    return Math.round(baseScore + (matchPercentage * maxAdditionalScore));
  }

  getDaysAgo(dateString: string): string {
    if (!dateString) return '0 days';
    
    const postDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day';
    if (diffDays < 30) return `${diffDays} days`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 month';
    return `${diffMonths} months`;
  }

  onToggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
  
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  onSearchChange(): void {
    this.loading = true;
    
    setTimeout(() => {
      if (!this.searchQuery.trim()) {
        this.filteredJobs = this.getJobsBasedOnFilters();
      } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredJobs = this.getJobsBasedOnFilters().filter(job => 
          job.title.toLowerCase().includes(query) || 
          job.company.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query)
        );
      }
      
      this.currentPage = 1;
      this.updateDisplayedJobs();
      this.loading = false;
    }, 400);  // Simulate network delay
  }

  toggleFilterDropdown(filter: string): void {
    Object.keys(this.showFilterDropdown).forEach(key => {
      if (key !== filter) this.showFilterDropdown[key] = false;
    });
    this.showFilterDropdown[filter] = !this.showFilterDropdown[filter];
  }

  setFilter(type: string, value: string): void {
    if (this.activeFilters[type] === value) {
      delete this.activeFilters[type];
    } else {
      this.activeFilters[type] = value;
    }
    
    this.showFilterDropdown[type] = false;
    this.applyFilters();
  }

  setSortOption(option: string): void {
    this.currentSort = option;
    this.showFilterDropdown['sort'] = false;
    this.sortJobs();
  }

  applyFilters(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.filteredJobs = this.getJobsBasedOnFilters();
      this.currentPage = 1;
      this.updateDisplayedJobs();
      this.loading = false;
    }, 400);
  }

  getJobsBasedOnFilters(): Job[] {
    let jobs: Job[];
    
    // First determine which tab we're on
    switch(this.currentTab) {
      case 'saved':
        jobs = [...this.savedJobs];
        break;
      case 'applied':
        jobs = [...this.appliedJobs];
        break;
      default:
        jobs = [...this.matchedJobs];
    }
    
    // Then apply active filters
    return jobs.filter(job => {
      for (const [type, value] of Object.entries(this.activeFilters)) {
        if (type === 'jobType' && job.jobType !== value) return false;
        if (type === 'locationType' && job.locationType !== value) return false;
        if (type === 'salaryRange' && job.salaryRange !== value) return false;
      }
      return true;
    });
  }

  sortJobs(): void {
    this.loading = true;
    
    setTimeout(() => {
      switch(this.currentSort) {
        case 'Match Score':
          this.filteredJobs.sort((a, b) => b.matchScore - a.matchScore);
          break;
        case 'Date Posted':
          this.filteredJobs.sort((a, b) => {
            const aDays = parseInt(a.postedDate.match(/\d+/)?.[0] || '0');
            const bDays = parseInt(b.postedDate.match(/\d+/)?.[0] || '0');
            return aDays - bDays;
          });
          break;
        case 'Salary: High to Low':
          this.filteredJobs.sort((a, b) => {
            const aMax = this.extractMaxSalary(a.salaryRange);
            const bMax = this.extractMaxSalary(b.salaryRange);
            return bMax - aMax;
          });
          break;
        case 'Salary: Low to High':
          this.filteredJobs.sort((a, b) => {
            const aMin = this.extractMinSalary(a.salaryRange);
            const bMin = this.extractMinSalary(b.salaryRange);
            return aMin - bMin;
          });
          break;
      }
      
      this.updateDisplayedJobs();
      this.loading = false;
    }, 400);
  }

  extractMinSalary(salaryRange: string): number {
    const matches = salaryRange.match(/\$?(\d+)k?/i);
    if (matches && matches[1]) {
      return parseInt(matches[1]) * (salaryRange.includes('k') ? 1000 : 1);
    }
    return 0;
  }

  extractMaxSalary(salaryRange: string): number {
    const matches = salaryRange.match(/\$?(\d+)k?\s*-\s*\$?(\d+)k?/i);
    if (matches && matches[2]) {
      return parseInt(matches[2]) * (salaryRange.includes('k') ? 1000 : 1);
    }
    return this.extractMinSalary(salaryRange);
  }

  toggleSaveJob(job: Job, event: Event): void {
    event.stopPropagation();
    job.isSaved = !job.isSaved;
    
    // Update localStorage
    const savedJobIds = this.getSavedJobIds();
    if (job.isSaved) {
      if (!savedJobIds.includes(job.id)) {
        savedJobIds.push(job.id);
      }
    } else {
      const index = savedJobIds.indexOf(job.id);
      if (index !== -1) {
        savedJobIds.splice(index, 1);
      }
    }
    localStorage.setItem('savedJobs', JSON.stringify(savedJobIds));
    
    // Update saved jobs list
    if (job.isSaved) {
      if (!this.savedJobs.some(j => j.id === job.id)) {
        this.savedJobs.push(job);
      }
    } else {
      this.savedJobs = this.savedJobs.filter(j => j.id !== job.id);
    }
    
    // If we're on the saved tab, update the display
    if (this.currentTab === 'saved') {
      this.filteredJobs = [...this.savedJobs];
      this.updateDisplayedJobs();
    }
  }

  applyForJob(job: Job, event: Event): void {
    if (job.isApplied) {
      return; // Already applied
    }
    
    event.stopPropagation();
    
    // Show confirmation dialog
    const confirmApply = confirm(`Apply for ${job.title} at ${job.company}? This will submit your profile to the employer.`);
    
    if (confirmApply) {
      // Simulate API call with loading state
      this.loading = true;
      
      // Get user profile data from auth service
      this.authService.getCurrentUserProfile().subscribe(userProfile => {
        // Create application payload with job ID and user profile
        const applicationData = {
          jobId: job.id,
          candidateProfile: userProfile,
          appliedDate: new Date().toISOString()
        };
        
        // Send to backend
        this.jobService.applyForJob(job.id)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: (response) => {
              // Mark as applied
              job.isApplied = true;
              job.applicationCount = (job.applicationCount || 0) + 1;
              
              // Update localStorage
              const appliedJobIds = this.getAppliedJobIds();
              if (!appliedJobIds.includes(job.id)) {
                appliedJobIds.push(job.id);
                localStorage.setItem('appliedJobs', JSON.stringify(appliedJobIds));
              }
              
              // Update applied jobs list
              if (!this.appliedJobs.some(j => j.id === job.id)) {
                this.appliedJobs.push(job);
              }
              
              alert(`Successfully applied for ${job.title} at ${job.company}!`);
              
              // If we're on the applied tab, update the display
              if (this.currentTab === 'applied') {
                this.filteredJobs = [...this.appliedJobs];
                this.updateDisplayedJobs();
              }
            },
            error: (error) => {
              console.error('Error applying for job:', error);
              alert('An error occurred while applying for the job. Please try again.');
            }
          });
      });
    }
  }
  viewJobDetails(job: Job): void {
    this.selectedJob = job;
  }

  closeJobDetails(): void {
    this.selectedJob = null;
  }

  changeTab(tab: string): void {
    if (this.currentTab === tab) return;
    
    this.loading = true;
    this.currentTab = tab;
    
    setTimeout(() => {
      switch(tab) {
        case 'saved':
          this.filteredJobs = [...this.savedJobs];
          break;
        case 'applied':
          this.filteredJobs = [...this.appliedJobs];
          break;
        default:
          this.filteredJobs = this.getJobsBasedOnFilters();
      }
      
      this.currentPage = 1;
      this.updateDisplayedJobs();
      this.loading = false;
    }, 400);
  }

  updateDisplayedJobs(): void {
    const startIndex = (this.currentPage - 1) * this.jobsPerPage;
    const endIndex = startIndex + this.jobsPerPage;
    this.displayedJobs = this.filteredJobs.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.filteredJobs.length / this.jobsPerPage);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    
    this.loading = true;
    this.currentPage = page;
    
    setTimeout(() => {
      this.updateDisplayedJobs();
      this.loading = false;
      // Scroll to top of jobs list
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      // Show all pages if there are 5 or fewer
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include page 1
      pages.push(1);
      
      // Calculate start and end of page range
      let start = Math.max(2, this.currentPage - 1);
      let end = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      // Adjust if at edges
      if (this.currentPage <= 2) {
        end = 4;
      } else if (this.currentPage >= this.totalPages - 1) {
        start = this.totalPages - 3;
      }
      
      // Add ellipsis after page 1 if necessary
      if (start > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add pages in range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if necessary
      if (end < this.totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }
      
      // Always include last page
      pages.push(this.totalPages);
    }
    
    return pages;
  }
}
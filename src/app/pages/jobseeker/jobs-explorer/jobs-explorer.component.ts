// jobs-explorer.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';


interface Job {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
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
  totalPages = 8;
  jobsPerPage = 6;
  
  // Mock data for jobs
  allJobs: Job[] = [
    {
      id: 1,
      title: 'Senior UX Designer',
      company: 'Google Inc.',
      companyLogo: 'assets/images/company-logos/google.png',
      jobType: 'Full-time',
      locationType: 'Remote',
      salaryRange: '$120k-165k',
      postedDate: 'Posted 2 days ago',
      matchScore: 92,
      isSaved: false,
      isApplied: false,
      description: 'We are looking for a Senior UX Designer to join our team and help create exceptional user experiences for our products. You will work closely with product managers, engineers, and other designers to conceptualize, prototype, and implement user interfaces.',
      responsibilities: [
        'Create user-centered designs by understanding business requirements and user feedback',
        'Create user flows, wireframes, prototypes and mockups',
        'Translate requirements into style guides, design systems, design patterns and attractive user interfaces',
        'Design UI elements such as input controls, navigational components and informational components',
        'Collaborate with other team members and stakeholders'
      ],
      requirements: [
        '5+ years of UX design experience',
        'Strong portfolio demonstrating UX design capabilities',
        'Proficiency in design tools such as Figma, Sketch, Adobe XD',
        'Experience with user testing and iterative design',
        'Excellent communication and collaboration skills'
      ],
      benefits: [
        'Competitive salary and equity',
        'Health, dental, and vision insurance',
        'Unlimited PTO',
        'Remote work options',
        'Professional development budget'
      ]
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'Microsoft',
      companyLogo: 'assets/images/company-logos/microsoft.png',
      jobType: 'Full-time',
      locationType: 'Hybrid',
      salaryRange: '$90k-120k',
      postedDate: 'Posted 3 days ago',
      matchScore: 88,
      isSaved: false,
      isApplied: false,
      description: 'Microsoft is seeking a talented Frontend Developer to join our team. In this role, you will be responsible for building and maintaining web applications using modern JavaScript frameworks.'
    },
    {
      id: 3,
      title: 'Product Manager',
      company: 'Apple Inc.',
      companyLogo: 'assets/images/company-logos/apple.png',
      jobType: 'Full-time',
      locationType: 'Onsite',
      salaryRange: '$140k-175k',
      postedDate: 'Posted 1 week ago',
      matchScore: 85,
      isSaved: false,
      isApplied: false,
      description: 'Apple is looking for a Product Manager to drive product strategy and execution. You will work with cross-functional teams to define, build, and launch innovative products.'
    },
    {
      id: 4,
      title: 'Data Scientist',
      company: 'Netflix',
      companyLogo: 'assets/images/company-logos/netflix.png',
      jobType: 'Full-time',
      locationType: 'Remote',
      salaryRange: '$130k-160k',
      postedDate: 'Posted 3 days ago',
      matchScore: 80,
      isSaved: false,
      isApplied: false,
      description: 'Netflix is seeking a Data Scientist to help drive business decisions through data analysis and modeling. You will work with large datasets to extract insights and build predictive models.'
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      company: 'Meta',
      companyLogo: 'assets/images/company-logos/meta.png',
      jobType: 'Full-time',
      locationType: 'Hybrid',
      salaryRange: '$120k-170k',
      postedDate: 'Posted 1 day ago',
      matchScore: 76,
      isSaved: false,
      isApplied: false,
      description: 'Meta is looking for a DevOps Engineer to build and maintain infrastructure, deployment, and operational processes. You will work with development teams to implement CI/CD pipelines and ensure system reliability.'
    },
    {
      id: 6,
      title: 'UI Designer',
      company: 'Airbnb',
      companyLogo: 'assets/images/company-logos/airbnb.png',
      jobType: 'Contract',
      locationType: 'Remote',
      salaryRange: '$100k-125k',
      postedDate: 'Posted 4 days ago',
      matchScore: 72,
      isSaved: false,
      isApplied: false,
      description: 'Airbnb is seeking a UI Designer to create visually appealing and functional user interfaces. You will collaborate with UX designers and developers to implement cohesive design systems.'
    },
    {
      id: 7,
      title: 'Backend Engineer',
      company: 'Amazon',
      companyLogo: 'assets/images/company-logos/amazon.png',
      jobType: 'Full-time',
      locationType: 'Onsite',
      salaryRange: '$130k-180k',
      postedDate: 'Posted 5 days ago',
      matchScore: 70,
      isSaved: false,
      isApplied: false,
      description: 'Amazon is looking for a Backend Engineer to design and implement scalable and reliable services. You will work with large-scale distributed systems and contribute to architecture decisions.'
    },
    {
      id: 8,
      title: 'Machine Learning Engineer',
      company: 'Tesla',
      companyLogo: 'assets/images/company-logos/tesla.png',
      jobType: 'Full-time',
      locationType: 'Hybrid',
      salaryRange: '$140k-190k',
      postedDate: 'Posted 1 week ago',
      matchScore: 68,
      isSaved: false,
      isApplied: false,
      description: 'Tesla is looking for a Machine Learning Engineer to develop and deploy ML models for autonomous driving systems. You will work with massive datasets and implement state-of-the-art algorithms.'
    },
    {
      id: 9,
      title: 'Marketing Specialist',
      company: 'Spotify',
      companyLogo: 'assets/images/company-logos/spotify.png',
      jobType: 'Full-time',
      locationType: 'Remote',
      salaryRange: '$80k-110k',
      postedDate: 'Posted 2 days ago',
      matchScore: 65,
      isSaved: false,
      isApplied: false,
      description: 'Spotify is seeking a Marketing Specialist to develop and execute marketing campaigns. You will analyze market trends and help drive user acquisition and retention strategies.'
    },
    {
      id: 10,
      title: 'Project Manager',
      company: 'Slack',
      companyLogo: 'assets/images/company-logos/slack.png',
      jobType: 'Full-time',
      locationType: 'Hybrid',
      salaryRange: '$90k-130k',
      postedDate: 'Posted 3 days ago',
      matchScore: 63,
      isSaved: false,
      isApplied: false,
      description: 'Slack is looking for a Project Manager to lead cross-functional teams and deliver projects on time and within budget. You will define project scope, goals, and deliverables.'
    },
    {
      id: 11,
      title: 'Cloud Architect',
      company: 'IBM',
      companyLogo: 'assets/images/company-logos/ibm.png',
      jobType: 'Full-time',
      locationType: 'Remote',
      salaryRange: '$150k-200k',
      postedDate: 'Posted 6 days ago',
      matchScore: 60,
      isSaved: false,
      isApplied: false,
      description: 'IBM is seeking a Cloud Architect to design and implement cloud-based solutions. You will provide technical guidance on cloud architecture and help migrate applications to the cloud.'
    },
    {
      id: 12,
      title: 'Mobile Developer',
      company: 'Uber',
      companyLogo: 'assets/images/company-logos/uber.png',
      jobType: 'Full-time',
      locationType: 'Hybrid',
      salaryRange: '$100k-140k',
      postedDate: 'Posted 4 days ago',
      matchScore: 58,
      isSaved: false,
      isApplied: false,
      description: 'Uber is looking for a Mobile Developer to build and maintain mobile applications. You will work with product and design teams to create intuitive and performant mobile experiences.'
    }
  ];

  matchedJobs: Job[] = [];
  savedJobs: Job[] = [];
  appliedJobs: Job[] = [];
  filteredJobs: Job[] = [];
  displayedJobs: Job[] = [];

  constructor() {}

  ngOnInit(): void {
    this.matchedJobs = [...this.allJobs];
    this.filteredJobs = [...this.matchedJobs];
    this.updateDisplayedJobs();
    
    // Simulate initial loading
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 800);
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
    }, 400);  // Simulate network delay
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
          // This is simplified - in a real app, you'd parse the date strings
          this.filteredJobs.sort((a, b) => {
            const aDays = parseInt(a.postedDate.match(/\d+/)?.[0] || '0');
            const bDays = parseInt(b.postedDate.match(/\d+/)?.[0] || '0');
            return aDays - bDays;
          });
          break;
        case 'Salary: High to Low':
          this.filteredJobs.sort((a, b) => {
            const aMax = parseInt(a.salaryRange.match(/\d+k/g)?.[1].replace('k', '000') || '0');
            const bMax = parseInt(b.salaryRange.match(/\d+k/g)?.[1].replace('k', '000') || '0');
            return bMax - aMax;
          });
          break;
        case 'Salary: Low to High':
          this.filteredJobs.sort((a, b) => {
            const aMin = parseInt(a.salaryRange.match(/\d+k/g)?.[0].replace('k', '000') || '0');
            const bMin = parseInt(b.salaryRange.match(/\d+k/g)?.[0].replace('k', '000') || '0');
            return aMin - bMin;
          });
          break;
      }
      
      this.updateDisplayedJobs();
      this.loading = false;
    }, 400);  // Simulate network delay
  }

  toggleSaveJob(job: Job, event: Event): void {
    event.stopPropagation();
    job.isSaved = !job.isSaved;
    
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
    event.stopPropagation();
    job.isApplied = true;
    
    if (!this.appliedJobs.some(j => j.id === job.id)) {
      this.appliedJobs.push(job);
    }
    
    // Show a success message (in a real app, this would be a proper modal or toast)
    const confirmApply = confirm(`Apply for ${job.title} at ${job.company}? This will submit your profile to the employer.`);
    
    if (confirmApply) {
      // Simulate API call with loading state
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        alert(`Successfully applied for ${job.title} at ${job.company}!`);
        
        // If we're on the applied tab, update the display
        if (this.currentTab === 'applied') {
          this.filteredJobs = [...this.appliedJobs];
          this.updateDisplayedJobs();
        }
      }, 1000);
    } else {
      job.isApplied = false;
      this.appliedJobs = this.appliedJobs.filter(j => j.id !== job.id);
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
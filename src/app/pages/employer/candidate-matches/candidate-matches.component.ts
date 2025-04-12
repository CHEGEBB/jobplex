import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarEmployerComponent } from '../../../components/sidebar-employer/sidebar-employer.component';

interface Candidate {
  id: number;
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  photo?: string;
  skills: string[];
  softSkills: string[];
  matchScore: number;
  matchHighlights: string[];
  status: 'new' | 'shortlisted' | 'contacted' | 'interviewing' | 'hired' | 'rejected';
  experience: {
    title: string;
    company: string;
    period: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  notes: string;
  aiInsights: {
    icon: string;
    title: string;
    description: string;
  }[];
}

interface Job {
  id: number;
  title: string;
  matches: number;
}

interface Interviewer {
  id: number;
  name: string;
  role: string;
}

interface InterviewData {
  type: 'phone' | 'video' | 'inPerson' | 'technical';
  date: string;
  startTime: string;
  endTime: string;
  interviewers: number[];
  notes: string;
}

@Component({
  selector: 'app-candidate-matches',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarEmployerComponent],
  templateUrl: './candidate-matches.component.html',
  styleUrls: ['./candidate-matches.component.scss']
})
export class CandidateMatchesComponent implements OnInit {
  // UI state
  showMobileMenu = false;
  selectedCandidate: Candidate | null = null;
  selectedCandidates: number[] = [];
  searchTerm = '';
  matchScoreFilter = 'all';
  statusFilter = 'all';
  selectedJobId: number | null = null;
  showStatusDropdown = false;
  showInterviewModal = false;
  interviewCandidate: Candidate | null = null;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 1;
  
  // Interview scheduling
  interviewData: InterviewData = {
    type: 'video',
    date: '',
    startTime: '',
    endTime: '',
    interviewers: [],
    notes: ''
  };
  
  interviewers: Interviewer[] = [
    { id: 1, name: 'John Smith', role: 'HR Manager' },
    { id: 2, name: 'Emily Chen', role: 'Tech Lead' },
    { id: 3, name: 'Michael Johnson', role: 'Senior Developer' },
    { id: 4, name: 'Sarah Wilson', role: 'Department Manager' },
    { id: 5, name: 'Robert Davies', role: 'CTO' }
  ];
  
  // Status configuration
  candidateStatuses: ('new' | 'shortlisted' | 'contacted' | 'interviewing' | 'hired' | 'rejected')[] = [
    'new', 'shortlisted', 'contacted', 'interviewing', 'hired', 'rejected'
  ];
  
  statusIcons = {
    'new': 'fa-user',
    'shortlisted': 'fa-bookmark',
    'contacted': 'fa-envelope',
    'interviewing': 'fa-calendar-alt',
    'hired': 'fa-check-circle',
    'rejected': 'fa-times-circle'
  };
  
  // Mock data
  jobs: Job[] = [
    { id: 1, title: 'Frontend Developer', matches: 24 },
    { id: 2, title: 'UX/UI Designer', matches: 18 },
    { id: 3, title: 'Backend Developer', matches: 31 },
    { id: 4, title: 'Project Manager', matches: 12 },
    { id: 5, title: 'DevOps Engineer', matches: 15 }
  ];
  
  candidates: Candidate[] = []; // Will be populated in ngOnInit
  filteredCandidates: Candidate[] = [];

  constructor() { }

  ngOnInit(): void {
    // Initialize with first job selected
    this.selectedJobId = this.jobs[0].id;
    
    // Generate mock candidate data
    this.generateMockCandidates();
    
    // Apply initial filters
    this.applyFilters();
    
    // Set interview date to tomorrow by default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.interviewData.date = tomorrow.toISOString().split('T')[0];
    this.interviewData.startTime = '10:00';
    this.interviewData.endTime = '11:00';
  }

  // Methods for UI interaction
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }
  
  selectJob(jobId: number): void {
    this.selectedJobId = jobId;
    this.applyFilters();
  }
  
  applyFilters(): void {
    let filtered = [...this.candidates];
    
    // Filter by job
if (this.selectedJobId !== null) {
  const jobIdMod = this.selectedJobId % this.jobs.length;
  filtered = filtered.filter(c => c.id % this.jobs.length === jobIdMod);
}
    
    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.skills.some(skill => skill.toLowerCase().includes(term))
      );
    }
    
    // Filter by match score
    if (this.matchScoreFilter !== 'all') {
      switch (this.matchScoreFilter) {
        case 'high':
          filtered = filtered.filter(c => c.matchScore >= 90);
          break;
        case 'medium':
          filtered = filtered.filter(c => c.matchScore >= 70 && c.matchScore < 90);
          break;
        case 'low':
          filtered = filtered.filter(c => c.matchScore < 70);
          break;
      }
    }
    
    // Filter by status
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === this.statusFilter);
    }
    
    // Update pagination
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    if (this.currentPage === 0 && this.totalPages > 0) {
      this.currentPage = 1;
    }
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredCandidates = filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  resetFilters(): void {
    this.searchTerm = '';
    this.matchScoreFilter = 'all';
    this.statusFilter = 'all';
    this.applyFilters();
  }
  
  // Modified to accept string or number
  changePage(page: number | string): void {
    // Only change page if page is a number
    if (typeof page === 'number') {
      this.currentPage = page;
      this.applyFilters();
    }
    // Ignore string values (like '...')
  }
  
  getPaginationArray(): (number | string)[] {
    const pages: (number | string)[] = [];
    
    if (this.totalPages <= 7) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Show dots if current page is more than 3
      if (this.currentPage > 3) {
        pages.push('...');
      }
      
      // Show current page and neighboring pages
      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Show dots if current page is less than totalPages - 2
      if (this.currentPage < this.totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(this.totalPages);
    }
    
    return pages;
  }
  
  // Candidate selection methods
  toggleCandidateSelection(candidateId: number): void {
    const index = this.selectedCandidates.indexOf(candidateId);
    if (index === -1) {
      this.selectedCandidates.push(candidateId);
    } else {
      this.selectedCandidates.splice(index, 1);
    }
  }
  
  isSelected(candidateId: number): boolean {
    return this.selectedCandidates.includes(candidateId);
  }
  
  clearSelection(): void {
    this.selectedCandidates = [];
  }
  
  // Batch actions for selected candidates
  batchShortlist(): void {
    this.candidates = this.candidates.map(c => {
      if (this.selectedCandidates.includes(c.id)) {
        return { ...c, status: 'shortlisted' as const };
      }
      return c;
    });
    this.applyFilters();
    this.clearSelection();
  }
  
  batchScheduleInterview(): void {
    if (this.selectedCandidates.length > 0) {
      const candidateId = this.selectedCandidates[0];
      const candidate = this.candidates.find(c => c.id === candidateId);
      if (candidate) {
        this.scheduleInterview(candidate);
      }
    }
  }
  
  batchReject(): void {
    this.candidates = this.candidates.map(c => {
      if (this.selectedCandidates.includes(c.id)) {
        return { ...c, status: 'rejected' as const };
      }
      return c;
    });
    this.applyFilters();
    this.clearSelection();
  }
  
  // Individual candidate actions
  viewCandidate(candidate: Candidate): void {
    this.selectedCandidate = { ...candidate };
  }
  
  closeModal(): void {
    this.selectedCandidate = null;
  }
  
  toggleShortlist(candidate: Candidate): void {
    const updated = this.candidates.map(c => {
      if (c.id === candidate.id) {
        return { 
          ...c, 
          status: c.status === 'shortlisted' ? 'new' as const : 'shortlisted' as const 
        };
      }
      return c;
    });
    
    this.candidates = updated;
    
    // Update the selected candidate if the modal is open
    if (this.selectedCandidate && this.selectedCandidate.id === candidate.id) {
      this.selectedCandidate = this.candidates.find(c => c.id === candidate.id) || null;
    }
    
    this.applyFilters();
  }
  
  contactCandidate(candidate: Candidate): void {
    console.log('Contact candidate:', candidate.name);
    // In a real application, this would open an email form or messaging interface
    alert(`Opening contact form for ${candidate.name} (${candidate.email})`);
  }
  
  downloadResume(candidate: Candidate): void {
    console.log('Download resume for:', candidate.name);
    // In a real application, this would trigger a file download
    alert(`Downloading resume for ${candidate.name}`);
  }
  
  // Status management
  toggleStatusDropdown(): void {
    this.showStatusDropdown = !this.showStatusDropdown;
  }
  
  getStatusIndex(status: string): number {
    return this.candidateStatuses.indexOf(status as any);
  }
  
  updateCandidateStatus(candidate: Candidate, status: 'new' | 'shortlisted' | 'contacted' | 'interviewing' | 'hired' | 'rejected'): void {
    // Update the candidate in the main list
    this.candidates = this.candidates.map(c => {
      if (c.id === candidate.id) {
        return { ...c, status };
      }
      return c;
    });
    
    // Update the selected candidate (in the modal)
    if (this.selectedCandidate && this.selectedCandidate.id === candidate.id) {
      this.selectedCandidate = { ...this.selectedCandidate, status };
    }
    
    // Close the dropdown
    this.showStatusDropdown = false;
    
    // Refresh the filtered list
    this.applyFilters();
  }
  
  // Interview scheduling
  scheduleInterview(candidate: Candidate): void {
    this.interviewCandidate = candidate;
    this.showInterviewModal = true;
  }
  
  closeInterviewModal(): void {
    this.showInterviewModal = false;
    this.interviewCandidate = null;
  }
  
  confirmScheduleInterview(): void {
    if (this.interviewCandidate) {
      // In a real app, this would save the interview to a database
      console.log('Interview scheduled:', {
        candidate: this.interviewCandidate,
        details: this.interviewData
      });
      
      // Update candidate status
      this.updateCandidateStatus(this.interviewCandidate, 'interviewing');
      
      // Close the modal
      this.closeInterviewModal();
      
      // Show confirmation
      alert(`Interview scheduled with ${this.interviewCandidate.name} on ${this.interviewData.date} at ${this.interviewData.startTime}`);
    }
  }
  
  // Notes management
  saveNotes(): void {
    if (this.selectedCandidate) {
      // In a real app, this would save the notes to a database
      this.candidates = this.candidates.map(c => {
        if (c.id === this.selectedCandidate?.id) {
          return { ...c, notes: this.selectedCandidate.notes };
        }
        return c;
      });
      
      alert('Notes saved successfully!');
    }
  }
  
  // Context menu (more actions)
  openActionMenu(candidate: Candidate): void {
    console.log('Open context menu for:', candidate.name);
    // In a real application, this would open a context menu with more actions
    alert(`Action menu for ${candidate.name}`);
  }
  
  // Mock data generation
  private generateMockCandidates(): void {
    const skills = [
      'JavaScript', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 
      'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C#', '.NET', 
      'PHP', 'Laravel', 'Ruby', 'Rails', 'SQL', 'MongoDB', 'Firebase',
      'AWS', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Redux',
      'TypeScript', 'GraphQL', 'REST API', 'SASS/SCSS', 'Tailwind CSS',
      'Bootstrap', 'Material UI', 'WordPress', 'Figma', 'Adobe XD'
    ];
    
    const softSkills = [
      'Communication', 'Teamwork', 'Problem-solving', 'Time management',
      'Adaptability', 'Leadership', 'Critical thinking', 'Creativity',
      'Emotional intelligence', 'Work ethic', 'Attention to detail',
      'Conflict resolution', 'Customer service', 'Project management'
    ];
    
    const names = [
      'Emma Thompson', 'Liam Wilson', 'Olivia Martinez', 'Noah Johnson', 'Ava Williams',
      'Ethan Brown', 'Sophia Jones', 'Mason Davis', 'Isabella Miller', 'Logan Garcia',
      'Mia Rodriguez', 'Lucas Smith', 'Charlotte Anderson', 'Jackson Taylor', 'Amelia Thomas',
      'Jack Clark', 'Harper Lewis', 'Aiden Lee', 'Abigail Walker', 'Elijah Hall',
      'Emily Young', 'Benjamin Allen', 'Elizabeth Scott', 'Daniel Green', 'Sofia King',
      'Matthew Baker', 'Avery Adams', 'Henry Nelson', 'Ella Mitchell', 'Alexander Hill',
      'Madison Carter', 'Sebastian Flores', 'Scarlett Murphy', 'David Cooper', 'Grace Rivera',
      'Joseph Reed', 'Chloe Cook', 'Samuel Morgan', 'Riley Bell', 'Owen Ross'
    ];
    
    const companies = [
      'TechGlobe Inc.', 'Innovate Solutions', 'Digital Dynamics', 'WebSphere Systems',
      'Quantum Software', 'Nexus Technologies', 'DataCore Enterprises', 'CodeCraft',
      'Future Systems', 'Cyber Innovations', 'Apex Digital', 'Meta Platforms',
      'Horizon Tech', 'Pulse Media', 'Insight Analytics', 'Cloud Connect',
      'Stellar Software', 'Vertex Systems', 'Elite Technologies', 'Prime Solutions'
    ];
    
    const colleges = [
      'University of Technology', 'Digital Institute', 'National Tech University',
      'State College of Engineering', 'Metropolitan University', 'Technical University',
      'Institute of Computer Science', 'College of Information Technology',
      'Global University', 'International Tech School', 'Academy of Science',
      'City University', 'Tech Valley College', 'Liberal Arts University'
    ];
    
    const locations = [
      'New York, NY', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA',
      'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Denver, CO',
      'Atlanta, GA', 'Miami, FL', 'Portland, OR', 'Washington, DC',
      'Philadelphia, PA', 'San Diego, CA', 'Nashville, TN', 'Dallas, TX',
      'Phoenix, AZ', 'Minneapolis, MN', 'Charlotte, NC', 'Remote'
    ];
    
    const jobTitles = [
      'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
      'UX/UI Designer', 'DevOps Engineer', 'Data Scientist', 'Product Manager',
      'Project Manager', 'QA Engineer', 'Software Engineer', 'Web Developer',
      'Mobile Developer', 'Systems Architect', 'Cloud Engineer',
      'Network Administrator', 'Database Administrator', 'AI Specialist',
      'Cybersecurity Analyst', 'Technical Support Specialist'
    ];
    
    const matchHighlights = [
      'Strong experience with required technologies',
      'Excellent portfolio of similar projects',
      'Skills perfectly aligned with job requirements',
      'Proven track record in similar roles',
      'Technical expertise matches your needs',
      'Educational background in relevant field',
      'Certifications in key technologies',
      'Expertise in tools mentioned in job description',
      'Experience in your industry',
      'Projects that demonstrate required skills',
      'Strong problem-solving abilities',
      'Collaborative work style that fits your team'
    ];
    
    const aiInsightIcons = [
      'fa-chart-line', 'fa-code', 'fa-users', 'fa-lightbulb',
      'fa-briefcase', 'fa-graduation-cap', 'fa-project-diagram',
      'fa-brain', 'fa-cogs', 'fa-tasks', 'fa-certificate'
    ];
    
    const aiInsightTitles = [
      'Skills Match', 'Experience Alignment', 'Education Relevance',
      'Project History', 'Team Compatibility', 'Growth Potential',
      'Technical Proficiency', 'Problem Solving', 'Learning Agility',
      'Communication Skills', 'Leadership Qualities'
    ];
    
    // Generate 40 candidates
    const generatedCandidates: Candidate[] = [];
    
    for (let i = 1; i <= 40; i++) {
      // Randomize candidate data
      const nameIndex = Math.floor(Math.random() * names.length);
      const name = names[nameIndex];
      
      // Create email from name
      const emailName = name.toLowerCase().replace(' ', '.').replace(/[^a-z.]/g, '');
      const emailDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'company.com'];
      const emailDomain = emailDomains[Math.floor(Math.random() * emailDomains.length)];
      const email = `${emailName}@${emailDomain}`;
      
      // Generate random phone number
      const phone = `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
      
      // Random location
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      // Random job title
      const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      
      // Random skills (5-8 skills)
      const numSkills = Math.floor(Math.random() * 4) + 5;
      const candidateSkills: string[] = [];
      for (let j = 0; j < numSkills; j++) {
        const skillIndex = Math.floor(Math.random() * skills.length);
        if (!candidateSkills.includes(skills[skillIndex])) {
          candidateSkills.push(skills[skillIndex]);
        }
      }
      
      // Random soft skills (3-5 skills)
      const numSoftSkills = Math.floor(Math.random() * 3) + 3;
      const candidateSoftSkills: string[] = [];
      for (let j = 0; j < numSoftSkills; j++) {
        const skillIndex = Math.floor(Math.random() * softSkills.length);
        if (!candidateSoftSkills.includes(softSkills[skillIndex])) {
          candidateSoftSkills.push(softSkills[skillIndex]);
        }
      }
      
      // Random match score (50-100)
      const matchScore = Math.floor(Math.random() * 51) + 50;
      
      // Random match highlights (2-4)
      const numHighlights = Math.floor(Math.random() * 3) + 2;
      const candidateHighlights: string[] = [];
      for (let j = 0; j < numHighlights; j++) {
        const highlightIndex = Math.floor(Math.random() * matchHighlights.length);
        if (!candidateHighlights.includes(matchHighlights[highlightIndex])) {
          candidateHighlights.push(matchHighlights[highlightIndex]);
        }
      }
      
      // Random status
      const statuses: ('new' | 'shortlisted' | 'contacted' | 'interviewing' | 'hired' | 'rejected')[] = ['new', 'shortlisted', 'contacted', 'interviewing', 'hired', 'rejected'];
      const statusWeights = [50, 20, 15, 10, 3, 2]; // Higher chance for 'new' status
      
      let statusIndex = 0;
      const randomValue = Math.random() * 100;
      let cumulativeWeight = 0;
      
      for (let j = 0; j < statusWeights.length; j++) {
        cumulativeWeight += statusWeights[j];
        if (randomValue <= cumulativeWeight) {
          statusIndex = j;
          break;
        }
      }
      
      const status = statuses[statusIndex];
      
      // Random work experience (1-3 jobs)
      const numJobs = Math.floor(Math.random() * 3) + 1;
      const experience = [];
      
      for (let j = 0; j < numJobs; j++) {
        const company = companies[Math.floor(Math.random() * companies.length)];
        const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
        
        const startYear = 2023 - (numJobs - j) * 2 - Math.floor(Math.random() * 2);
        const endYear = j === 0 ? 'Present' : (startYear + 1 + Math.floor(Math.random() * 2)).toString();
        
        experience.push({
          title: jobTitle,
          company,
          period: `${startYear} - ${endYear}`,
          description: `Worked on various ${jobTitle.toLowerCase()} projects, collaborated with cross-functional teams, and delivered high-quality software solutions.`
        });
      }
      
      // Random education (1-2 degrees)
      const numDegrees = Math.floor(Math.random() * 2) + 1;
      const education = [];
      
      for (let j = 0; j < numDegrees; j++) {
        const institution = colleges[Math.floor(Math.random() * colleges.length)];
        const degrees = ['Bachelor of Science in Computer Science', 'Master of Science in Computer Science', 
                          'Bachelor of Engineering', 'Master of Engineering', 
                          'Bachelor of Science in Information Technology', 'Master of Information Technology',
                          'Bachelor of Arts in Design', 'Master of Design'];
        const degree = degrees[Math.floor(Math.random() * degrees.length)];
        const year = (2023 - (numJobs * 2) - Math.floor(Math.random() * 3) - (j * 4)).toString();
        
        education.push({
          degree,
          institution,
          year
        });
      }
      
      // AI insights (3 insights)
      const aiInsights = [];
      const usedTitleIndices: number[] = [];
      
      for (let j = 0; j < 3; j++) {
        let titleIndex: number;
        do {
          titleIndex = Math.floor(Math.random() * aiInsightTitles.length);
        } while (usedTitleIndices.includes(titleIndex));
        
        usedTitleIndices.push(titleIndex);
        
        const title = aiInsightTitles[titleIndex];
        const icon = aiInsightIcons[Math.floor(Math.random() * aiInsightIcons.length)];
        
        aiInsights.push({
          icon,
          title,
          description: `This candidate shows strong ${title.toLowerCase()} that aligns with your job requirements. Their background suggests they would be a good fit for this role.`
        });
      }
      
      generatedCandidates.push({
        id: i,
        name,
        title,
        email,
        phone,
        location,
        skills: candidateSkills,
        softSkills: candidateSoftSkills,
        matchScore,
        matchHighlights: candidateHighlights,
        status,
        experience,
        education,
        notes: '',
        aiInsights
      });
    }
    
    this.candidates = generatedCandidates;
  }
}
// src/app/employer/pages/chat-interface/chat-interface.component.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faPaperPlane, faSearch, faFilter, faStar, faSave, 
  faLightbulb, faChartLine, faBriefcase, faUserTie, 
  faSpinner, faTimes, faUser, faBookmark, faCog
} from '@fortawesome/free-solid-svg-icons';
import { SidebarEmployerComponent } from '../../../components/sidebar-employer/sidebar-employer.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { AiService, ChatMessage, MatchedCandidate, SavedChatQuery } from '../../../services/ai.service';
import { JobService } from '../../../services/job.service';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService } from '../../../services/profile.service';

interface Candidate {
  id: number;
  name: string;
  avatar: string;
  title: string;
  skills: string[];
  experience: number;
  matchScore: number;
  location: string;
  availability: string;
}

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    SidebarEmployerComponent
  ],
  templateUrl: './chat-interface.component.html',
  styleUrls: ['./chat-interface.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class ChatInterfaceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  
  // Icons
  faPaperPlane = faPaperPlane;
  faSearch = faSearch;
  faFilter = faFilter;
  faStar = faStar;
  faSave = faSave;
  faLightbulb = faLightbulb;
  faChartLine = faChartLine;
  faBriefcase = faBriefcase;
  faUserTie = faUserTie;
  faSpinner = faSpinner;
  faTimes = faTimes;
  faUser = faUser;
  faBookmark = faBookmark;
  faCog = faCog;

  // State
  currentMessage: string = '';
  isLoading: boolean = false;
  chatMessages: ChatMessage[] = [];
  suggestedQueries: string[] = [
    'Find React developers with 3+ years experience',
    'Frontend developers who know TypeScript',
    'DevOps engineers familiar with AWS',
    'Data scientists with Python and TensorFlow experience',
    'UI/UX designers with Figma skills'
  ];
  activeSection: 'chat' | 'candidates' | 'insights' | 'saved' = 'chat';
  showFilterPanel: boolean = false;
  showWelcomeOverlay: boolean = true;

  // Skills filter
  availableSkills: string[] = [];
  selectedSkills: string[] = [];
  minExperience: number = 0;
  maxExperience: number = 15;
  experienceFilterValue: number = 0;

  // Candidates and saved searches
  matchedCandidates: Candidate[] = [];
  savedSearches: SavedChatQuery[] = [];
  
  // Current employer jobs
  employerJobs: any[] = [];
  
  // Cleanup subscription
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private aiService: AiService,
    private jobService: JobService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    // Initialize with welcome message
    this.chatMessages.push({
      type: 'ai',
      content: 'Hello! I\'m your AI recruitment assistant. How can I help you find the perfect candidates today?',
      timestamp: new Date()
    });

    // Load skills for filter
    this.loadAvailableSkills();
    
    // Load employer's jobs
    this.loadEmployerJobs();
    
    // Load saved chat queries
    this.loadSavedChatQueries();

    // Simulate a short delay before hiding welcome overlay
    setTimeout(() => {
      this.showWelcomeOverlay = false;
    }, 2000);
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadAvailableSkills(): void {
    // This would typically come from a service
    this.availableSkills = [
      'Angular', 'React', 'Vue', 'TypeScript', 'JavaScript', 'Python', 'Java', 
      'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'SQL', 'MongoDB', 'Firebase', 
      'AWS', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Figma', 'Adobe XD', 
      'Sketch', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'TensorFlow'
    ];
  }
  
  loadEmployerJobs(): void {
    this.jobService.getEmployerJobs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (jobs) => {
          this.employerJobs = jobs;
          console.log('Employer jobs loaded:', jobs);
        },
        error: (error) => {
          console.error('Error loading employer jobs:', error);
        }
      });
  }
  
  loadSavedChatQueries(): void {
    this.aiService.getSavedChatQueries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (queries) => {
          this.savedSearches = queries;
          console.log('Saved chat queries loaded:', queries);
        },
        error: (error) => {
          console.error('Error loading saved chat queries:', error);
        }
      });
  }

  sendMessage(): void {
    if (!this.currentMessage.trim()) return;

    // Add user message
    this.chatMessages.push({
      type: 'user',
      content: this.currentMessage,
      timestamp: new Date()
    });

    // Process message
    this.isLoading = true;
    const userQuery = this.currentMessage;
    this.currentMessage = '';
    
    // Scroll to bottom to show user message
    setTimeout(() => this.scrollToBottom(), 100);

    // Use actual AI service to process query
    this.aiService.employerChatQuery(userQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // Add AI response
          this.chatMessages.push({
            type: 'ai',
            content: response.message,
            timestamp: new Date(),
            candidates: response.matchedCandidates,
            suggestedFollowup: response.suggestedFollowup
          });
          
          // Convert matched candidates to our UI format
          if (response.matchedCandidates && response.matchedCandidates.length > 0) {
            this.matchedCandidates = response.matchedCandidates.map(candidate => this.convertToUiCandidate(candidate));
            
            // Show candidates section if there are matches
            setTimeout(() => this.activeSection = 'candidates', 500);
          }
          
          // Scroll to show AI response
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error processing chat query:', error);
          
          // Add error message
          this.chatMessages.push({
            type: 'ai',
            content: `I'm sorry, I encountered an error processing your request: ${error.message}`,
            timestamp: new Date()
          });
          
          // Scroll to show error message
          setTimeout(() => this.scrollToBottom(), 100);
        }
      });
  }
  
  // Convert API candidate to UI candidate format
  convertToUiCandidate(apiCandidate: MatchedCandidate): Candidate {
    return {
      id: apiCandidate.id,
      name: apiCandidate.name,
      avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 30) + 1}.jpg`,
      title: apiCandidate.experience.split(' ')[0], // Extract job title from experience description
      skills: apiCandidate.relevantSkills,
      experience: parseInt(apiCandidate.experience.match(/\d+/) ? apiCandidate.experience.match(/\d+/)![0] : '3'), // Extract years from experience
      matchScore: apiCandidate.matchPercentage,
      location: 'Location data pending', // This would come from a profile service
      availability: apiCandidate.appliedToJobs && apiCandidate.appliedToJobs.length > 0 ? 'Applied to your jobs' : 'Available now'
    };
  }

  useSuggestedQuery(query: string): void {
    this.currentMessage = query;
    this.sendMessage();
  }
  
  useSuggestedFollowup(followup: string): void {
    this.currentMessage = followup;
    this.sendMessage();
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  setActiveSection(section: 'chat' | 'candidates' | 'insights' | 'saved'): void {
    this.activeSection = section;
  }

  toggleFilterPanel(): void {
    this.showFilterPanel = !this.showFilterPanel;
  }

  toggleSkill(skill: string): void {
    if (this.selectedSkills.includes(skill)) {
      this.selectedSkills = this.selectedSkills.filter(s => s !== skill);
    } else {
      this.selectedSkills.push(skill);
    }
    this.filterCandidates();
  }

  updateExperienceFilter(value: any): void {
    this.experienceFilterValue = parseInt(value.target.value, 10);
    this.filterCandidates();
  }

  filterCandidates(): void {
    // Filter the already matched candidates based on selected criteria
    const originalCandidates = [...this.matchedCandidates];
    
    if (this.selectedSkills.length > 0) {
      this.matchedCandidates = originalCandidates.filter(candidate => 
        this.selectedSkills.every(skill => candidate.skills.includes(skill))
      );
    } else {
      this.matchedCandidates = originalCandidates;
    }
    
    if (this.experienceFilterValue > 0) {
      this.matchedCandidates = this.matchedCandidates.filter(candidate => 
        candidate.experience >= this.experienceFilterValue
      );
    }
  }

  saveCurrentSearch(): void {
    // We don't need to explicitly save since the backend saves all queries automatically
    // Just reload the saved queries
    this.loadSavedChatQueries();
    
    // Show confirmation
    alert("Search saved successfully!");
    
    // Switch to saved tab
    this.activeSection = 'saved';
  }

  loadSavedSearch(search: SavedChatQuery): void {
    // Add the saved query to the chat as a user message
    this.chatMessages.push({
      type: 'user',
      content: search.query,
      timestamp: new Date(search.created_at)
    });
    
    // Add the saved response as an AI message
    this.chatMessages.push({
      type: 'ai',
      content: search.response.message,
      timestamp: new Date(search.created_at),
      candidates: search.response.matchedCandidates,
      suggestedFollowup: search.response.suggestedFollowup
    });
    
    // Convert the matched candidates for the UI
    if (search.response.matchedCandidates && search.response.matchedCandidates.length > 0) {
      this.matchedCandidates = search.response.matchedCandidates.map(candidate => this.convertToUiCandidate(candidate));
    }
    
    // Switch back to chat or candidates section
    if (this.matchedCandidates.length > 0) {
      this.activeSection = 'candidates';
    } else {
      this.activeSection = 'chat';
    }
    
    // Scroll to the bottom of the chat
    setTimeout(() => this.scrollToBottom(), 100);
  }

  deleteSavedSearch(id: number): void {
    this.aiService.deleteChatQuery(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.savedSearches = this.savedSearches.filter(search => search.id !== id);
        },
        error: (error) => {
          console.error('Error deleting saved search:', error);
          alert('Error deleting saved search. Please try again.');
        }
      });
  }

  dismissWelcomeOverlay(): void {
    this.showWelcomeOverlay = false;
  }
  
  viewCandidateProfile(candidateId: number): void {
    // This would navigate to the candidate profile page
    // In a real application, this might be a modal or a separate page
    this.router.navigate(['/employer/candidates', candidateId]);
  }
  
  contactCandidate(candidateId: number): void {
    // This would open a contact form or messaging interface
    alert(`Contact functionality for candidate ${candidateId} would open here.`);
  }
}
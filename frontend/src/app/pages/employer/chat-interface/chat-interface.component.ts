import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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

interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

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

interface SavedSearch {
  id: number;
  query: string;
  date: Date;
  results: number;
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
export class ChatInterfaceComponent implements OnInit, AfterViewInit {
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
  availableSkills: string[] = ['Angular', 'React', 'Vue', 'TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'SQL', 'MongoDB', 'Firebase', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Figma', 'Adobe XD', 'Sketch'];
  selectedSkills: string[] = [];
  minExperience: number = 0;
  maxExperience: number = 15;
  experienceFilterValue: number = 0;

  // Candidates and saved searches
  matchedCandidates: Candidate[] = [];
  savedSearches: SavedSearch[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize with welcome message
    this.chatMessages.push({
      type: 'ai',
      content: 'Hello! I\'m your AI recruitment assistant. How can I help you find the perfect candidates today?',
      timestamp: new Date()
    });

    // Generate sample candidates
    this.generateSampleCandidates();
    
    // Generate sample saved searches
    this.generateSampleSavedSearches();

    // Simulate a short delay before hiding welcome overlay
    setTimeout(() => {
      this.showWelcomeOverlay = false;
    }, 2000);
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
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

    // Simulate AI processing
    setTimeout(() => {
      this.isLoading = false;
      
      // Add AI response
      if (userQuery.toLowerCase().includes('developer') || 
          userQuery.toLowerCase().includes('programmer') ||
          userQuery.toLowerCase().includes('engineer')) {
        this.chatMessages.push({
          type: 'ai',
          content: `I've found several candidates matching your search for "${userQuery}". Would you like to see the best matches?`,
          timestamp: new Date()
        });
        
        // Show matched candidates section after a response that likely requires showing candidates
        setTimeout(() => this.activeSection = 'candidates', 500);
      } else if (userQuery.toLowerCase().includes('trends') || 
                userQuery.toLowerCase().includes('market') || 
                userQuery.toLowerCase().includes('salary')) {
        this.chatMessages.push({
          type: 'ai',
          content: `Based on current market data, I can provide insights about "${userQuery}". Would you like me to show the detailed analysis?`,
          timestamp: new Date()
        });
        
        // Show insights section
        setTimeout(() => this.activeSection = 'insights', 500);
      } else {
        this.chatMessages.push({
          type: 'ai',
          content: `I'm analyzing your request about "${userQuery}". Can you provide more details about the specific skills or experience level you're looking for?`,
          timestamp: new Date()
        });
      }
      
      // Scroll to show AI response
      setTimeout(() => this.scrollToBottom(), 100);
    }, 1500);
  }

  useSuggestedQuery(query: string): void {
    this.currentMessage = query;
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
    // This would actually make an API call in a real application
    // For now we'll just filter our sample data
    this.generateSampleCandidates();
    
    if (this.selectedSkills.length > 0) {
      this.matchedCandidates = this.matchedCandidates.filter(candidate => 
        this.selectedSkills.every(skill => candidate.skills.includes(skill))
      );
    }
    
    if (this.experienceFilterValue > 0) {
      this.matchedCandidates = this.matchedCandidates.filter(candidate => 
        candidate.experience >= this.experienceFilterValue
      );
    }
  }

  saveCurrentSearch(): void {
    // In a real app, this would save to a database
    const newSavedSearch: SavedSearch = {
      id: this.savedSearches.length + 1,
      query: this.chatMessages[this.chatMessages.length - 2]?.content || "Recent search",
      date: new Date(),
      results: this.matchedCandidates.length
    };
    
    this.savedSearches.unshift(newSavedSearch);
    
    // Show confirmation
    alert("Search saved successfully!");
  }

  loadSavedSearch(search: SavedSearch): void {
    this.currentMessage = search.query;
    this.sendMessage();
  }

  deleteSavedSearch(id: number): void {
    this.savedSearches = this.savedSearches.filter(search => search.id !== id);
  }

  dismissWelcomeOverlay(): void {
    this.showWelcomeOverlay = false;
  }

  // Sample data generation
  private generateSampleCandidates(): void {
    const names = [
      "Emily Johnson", "Michael Chen", "Sophia Rodriguez", "David Kim", 
      "Olivia Williams", "James Smith", "Ava Martinez", "Liam Wilson",
      "Isabella Davis", "Noah Brown", "Mia Taylor", "Ethan Anderson"
    ];
    
    const titles = [
      "Frontend Developer", "Backend Engineer", "Full Stack Developer", 
      "UX/UI Designer", "DevOps Engineer", "Data Scientist", 
      "Machine Learning Engineer", "Mobile App Developer"
    ];
    
    const allSkills = [
      "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", "Python", 
      "Java", "C#", ".NET", "PHP", "Ruby", "Go", "Kotlin", "Swift", "SQL", 
      "MongoDB", "PostgreSQL", "AWS", "Azure", "GCP", "Docker", "Kubernetes",
      "CI/CD", "Git", "Figma", "Sketch", "Adobe XD", "TensorFlow", "PyTorch"
    ];
    
    const locations = [
      "New York, NY", "San Francisco, CA", "Austin, TX", "Seattle, WA",
      "Boston, MA", "Chicago, IL", "Los Angeles, CA", "Denver, CO",
      "Atlanta, GA", "Remote"
    ];
    
    const availabilities = [
      "Immediately", "2 weeks notice", "1 month notice", "Available now",
      "Currently interviewing", "Open to offers"
    ];

    this.matchedCandidates = Array(12).fill(0).map((_, i) => {
      const skillCount = 4 + Math.floor(Math.random() * 5); // 4-8 skills
      const randomSkills = new Set<string>();
      
      while (randomSkills.size < skillCount) {
        randomSkills.add(allSkills[Math.floor(Math.random() * allSkills.length)]);
      }
      
      return {
        id: i + 1,
        name: names[i % names.length],
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${i + 1}.jpg`,
        title: titles[Math.floor(Math.random() * titles.length)],
        skills: Array.from(randomSkills),
        experience: 1 + Math.floor(Math.random() * 10),
        matchScore: 70 + Math.floor(Math.random() * 30),
        location: locations[Math.floor(Math.random() * locations.length)],
        availability: availabilities[Math.floor(Math.random() * availabilities.length)]
      };
    });
    
    // Sort by match score (highest first)
    this.matchedCandidates.sort((a, b) => b.matchScore - a.matchScore);
  }

  private generateSampleSavedSearches(): void {
    this.savedSearches = [
      {
        id: 1,
        query: "React developers with TypeScript experience",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        results: 15
      },
      {
        id: 2,
        query: "Senior DevOps engineers with Kubernetes",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        results: 8
      },
      {
        id: 3,
        query: "UI/UX designers with Figma skills",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        results: 12
      }
    ];
  }
}
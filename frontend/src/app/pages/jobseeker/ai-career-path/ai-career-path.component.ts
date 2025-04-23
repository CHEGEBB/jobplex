// ai-career-path.component.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { AiService, CareerPath, CareerPathResponse, LearningResource as AILearningResource } from '../../../services/ai.service';
import { Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// Register Chart.js components
Chart.register(...registerables);

interface ChatMessage {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface CareerPosition {
  title: string;
  timeline: string;
  description: string;
}

interface SkillGap {
  name: string;
  current: number;
  required: number;
}

interface LearningResource {
  title: string;
  type: string;
  typeClass: string;
  duration: string;
  description: string;
  link: string;
}

interface IndustryTrend {
  title: string;
  description: string;
  trendValue: string;
  trendDirection: 'up' | 'down';
  trendClass: string;
}

interface SalaryInfo {
  position: string;
  range: string;
  growth: string;
  growthIndicator: 'up' | 'down';
  growthClass: string;
}

interface TimelineMilestone {
  date: string;
  title: string;
  description: string;
  skills: string[];
  markerClass: string;
}

interface GrowthOpportunity {
  skillName: string;
  currentDemand: number;
  projectedDemand: number;
  industryAverage: number;
}

@Component({
  selector: 'app-ai-career-path',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './ai-career-path.component.html',
  styleUrls: ['./ai-career-path.component.scss']
})
export class AiCareerPathComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('growthChart') growthChartRef!: ElementRef;
  
  // Chart instance
  private growthChart: Chart | null = null;
  
  // Sidebar state
  sidebarCollapsed = false;
  
  // Chat variables
  userMessage = '';
  chatMessages: ChatMessage[] = [
    {
      text: "Hello! I'm your AI career assistant. How can I help with your career development today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ];
  
  // Career Path data
  careerPath: CareerPosition[] = [];
  
  // Skill Gap Analysis data
  skillGapAnalysis: SkillGap[] = [];
  
  // Growth Opportunities data
  growthOpportunities: GrowthOpportunity[] = [];
  
  // Learning Resources data
  learningResources: LearningResource[] = [];
  
  // Industry Trends data
  industryTrends: IndustryTrend[] = [];
  
  // Salary Information data
  salaryInformation: SalaryInfo[] = [];
  
  // Career Timeline data
  careerTimeline: TimelineMilestone[] = [];

  // Loading states
  isLoading = false;
  loadingError = '';

  // Subscriptions
  private subscriptions: Subscription[] = [];

  // AI Analysis data
  analysisText = '';
  selectedCareerPath: CareerPath | null = null;
  allCareerPaths: CareerPath[] = [];
  savedCareerPaths: any[] = [];

  constructor(private aiService: AiService) {}

  ngOnInit(): void {
    this.sidebarCollapsed = window.innerWidth < 768;
    this.loadCareerPathRecommendations();
    this.loadSavedCareerPaths();
  }

  ngAfterViewInit(): void {
    this.initGrowthChartIfDataAvailable();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    
    // Destroy chart
    if (this.growthChart) {
      this.growthChart.destroy();
    }
  }
  
  onToggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  loadCareerPathRecommendations(): void {
    this.isLoading = true;
    this.loadingError = '';
    
    const subscription = this.aiService.getCareerPathRecommendations()
      .pipe(
        catchError(error => {
          this.loadingError = error.message || 'Failed to load career path recommendations';
          console.error('Error loading career paths:', error);
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe(response => {
        this.isLoading = false;
        if (response) {
          this.processCareerPathResponse(response);
        }
      });
      
    this.subscriptions.push(subscription);
  }

  loadSavedCareerPaths(): void {
    const subscription = this.aiService.getSavedCareerPaths()
      .pipe(
        catchError(error => {
          console.error('Error loading saved career paths:', error);
          return of([]);
        })
      )
      .subscribe(paths => {
        this.savedCareerPaths = paths;
      });
      
    this.subscriptions.push(subscription);
  }

  deleteCareerPath(id: number): void {
    const subscription = this.aiService.deleteCareerPath(id)
      .pipe(
        catchError(error => {
          console.error('Error deleting career path:', error);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          // Remove the deleted path from the local array
          this.savedCareerPaths = this.savedCareerPaths.filter(path => path.id !== id);
        }
      });
      
    this.subscriptions.push(subscription);
  }

  sendMessage(): void {
    if (!this.userMessage.trim()) return;
    
    // Add user message to chat
    this.chatMessages.push({
      text: this.userMessage,
      sender: 'user',
      timestamp: new Date()
    });
    
    // Clear input field
    const userQuery = this.userMessage;
    this.userMessage = '';
    
    // Scroll to bottom of chat
    setTimeout(() => {
      this.scrollChatToBottom();
    });
    
    // In a real implementation, you would send this query to an AI endpoint
    // For now, we'll simulate responses based on our existing data
    this.simulateResponse(userQuery);
  }

  private simulateResponse(query: string): void {
    // Add loading indicator
    this.chatMessages.push({
      text: "Thinking...",
      sender: 'ai',
      timestamp: new Date()
    });
    
    // Scroll to bottom
    this.scrollChatToBottom();
    
    // Simulate API call delay
    setTimeout(() => {
      // Remove loading message
      this.chatMessages.pop();
      
      // Generate response based on context
      let response = '';
      
      // Simple keyword matching for demo purposes
      if (query.toLowerCase().includes('career') || query.toLowerCase().includes('path')) {
        response = `Based on your profile, I recommend exploring the ${this.allCareerPaths.length > 0 ? this.allCareerPaths[0].title : 'software development'} path, which has a ${this.allCareerPaths.length > 0 ? this.allCareerPaths[0].matchPercentage : '75'}% match to your skills.`;
      } else if (query.toLowerCase().includes('skill') || query.toLowerCase().includes('gap')) {
        if (this.selectedCareerPath && this.selectedCareerPath.skillGaps.length > 0) {
          response = `Your main skill gaps for the ${this.selectedCareerPath.title} path are: ${this.selectedCareerPath.skillGaps.join(', ')}.`;
        } else {
          response = "I recommend focusing on improving your technical architecture and leadership skills to advance to the next career level.";
        }
      } else if (query.toLowerCase().includes('learn') || query.toLowerCase().includes('resource')) {
        if (this.selectedCareerPath && this.selectedCareerPath.learningResources.length > 0) {
          const resource = this.selectedCareerPath.learningResources[0];
          response = `I recommend checking out "${resource.name}" which is a ${resource.type} about ${resource.description}.`;
        } else {
          response = "I've curated some learning resources that would help you develop the skills needed for your career progression. Check the Learning Resources section.";
        }
      } else {
        response = "I'm here to help with your career development. Feel free to ask about your recommended career paths, skill gaps, or learning resources.";
      }
      
      // Add response to chat
      this.chatMessages.push({
        text: response,
        sender: 'ai',
        timestamp: new Date()
      });
      
      // Scroll to bottom
      this.scrollChatToBottom();
    }, 1500);
  }

  private scrollChatToBottom(): void {
    if (this.chatContainer) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }

  // Converts the API career path data to our component format
  private processCareerPathResponse(response: CareerPathResponse): void {
    if (!response) return;
    
    this.analysisText = response.analysis;
    this.allCareerPaths = response.careerPaths;
    
    if (response.careerPaths.length > 0) {
      this.selectedCareerPath = response.careerPaths[0];
      this.updateUIFromSelectedCareerPath();
    }
  }

  selectCareerPath(path: CareerPath): void {
    this.selectedCareerPath = path;
    this.updateUIFromSelectedCareerPath();
  }

  selectSavedCareerPath(savedPath: any): void {
    this.analysisText = savedPath.analysis;
    this.allCareerPaths = savedPath.career_paths;
    
    if (savedPath.career_paths.length > 0) {
      this.selectedCareerPath = savedPath.career_paths[0];
      this.updateUIFromSelectedCareerPath();
    }
  }

  private updateUIFromSelectedCareerPath(): void {
    if (!this.selectedCareerPath) return;
    
    // Update career path
    this.careerPath = this.generateCareerPathFromAPI(this.selectedCareerPath);
    
    // Update skill gaps
    this.skillGapAnalysis = this.generateSkillGapsFromAPI(this.selectedCareerPath);
    
    // Update learning resources
    this.learningResources = this.generateLearningResourcesFromAPI(this.selectedCareerPath);
    
    // Generate other data based on the career path
    this.generateGrowthOpportunities();
    this.generateIndustryTrends();
    this.generateSalaryInformation();
    this.generateCareerTimeline();
    
    // Initialize or update the chart
    setTimeout(() => {
      this.initGrowthChartIfDataAvailable();
      
      // Add animation classes to skill bars after update
      const skillBars = document.querySelectorAll('.skill-progress-bar');
      skillBars.forEach(bar => {
        bar.classList.remove('animate-skill');
        setTimeout(() => {
          bar.classList.add('animate-skill');
        }, 10);
      });
    }, 300);
  }

  private generateCareerPathFromAPI(careerPath: CareerPath): CareerPosition[] {
    // This is a simplified example - in a real app, you would map API data more comprehensively
    const positions: CareerPosition[] = [];
    
    // Add current position
    positions.push({
      title: careerPath.title,
      timeline: 'Current',
      description: careerPath.description
    });
    
    // Add future positions (these would come from the API in a real implementation)
    positions.push({
      title: `Senior ${careerPath.title}`,
      timeline: 'Next 1-2 years',
      description: `Advanced role with deeper expertise in ${careerPath.title} specialization.`
    });
    
    positions.push({
      title: `Lead ${careerPath.title}`,
      timeline: '3-5 years',
      description: 'Leading technical decisions and mentoring team members.'
    });
    
    return positions;
  }

  private generateSkillGapsFromAPI(careerPath: CareerPath): SkillGap[] {
    return careerPath.skillGaps.map(skill => {
      // Calculate a mock current and required level
      return {
        name: skill,
        current: Math.floor(Math.random() * 5) + 3, // Random number between 3-7
        required: Math.floor(Math.random() * 3) + 7  // Random number between 7-9
      };
    });
  }

  private generateLearningResourcesFromAPI(careerPath: CareerPath): LearningResource[] {
    return careerPath.learningResources.map(resource => {
      let typeClass = 'bg-blue-100 text-blue-800';
      
      if (resource.type.toLowerCase().includes('book')) {
        typeClass = 'bg-green-100 text-green-800';
      } else if (resource.type.toLowerCase().includes('workshop')) {
        typeClass = 'bg-purple-100 text-purple-800';
      } else if (resource.type.toLowerCase().includes('certification')) {
        typeClass = 'bg-yellow-100 text-yellow-800';
      }
      
      return {
        title: resource.name,
        type: resource.type,
        typeClass: typeClass,
        duration: this.getDurationForResourceType(resource.type),
        description: resource.description,
        link: '#'
      };
    });
  }

  private getDurationForResourceType(type: string): string {
    switch (type.toLowerCase()) {
      case 'course':
        return `${Math.floor(Math.random() * 30) + 10} hours`;
      case 'book':
        return `${Math.floor(Math.random() * 300) + 100} pages`;
      case 'workshop':
        return `${Math.floor(Math.random() * 3) + 1} days`;
      case 'certification':
        return `${Math.floor(Math.random() * 3) + 1} months prep`;
      default:
        return 'Varies';
    }
  }

  private generateGrowthOpportunities(): void {
    if (!this.selectedCareerPath) return;
    
    // Generate growth opportunities based on skill gaps
    this.growthOpportunities = this.selectedCareerPath.skillGaps.slice(0, 5).map(skill => {
      return {
        skillName: skill,
        currentDemand: Math.floor(Math.random() * 30) + 40,  // Random between 40-69
        projectedDemand: Math.floor(Math.random() * 20) + 70, // Random between 70-89
        industryAverage: Math.floor(Math.random() * 20) + 60  // Random between 60-79
      };
    });
  }

  private generateIndustryTrends(): void {
    if (!this.selectedCareerPath) return;
    
    // In a real app, this would come from the API
    this.industryTrends = [
      {
        title: `${this.selectedCareerPath.title} Specialists`,
        description: `Growing demand for ${this.selectedCareerPath.title} specialists in the industry.`,
        trendValue: '+38%',
        trendDirection: 'up',
        trendClass: 'text-green-600'
      },
      {
        title: 'Remote Work',
        description: 'Continued shift towards remote work in this field.',
        trendValue: '+25%',
        trendDirection: 'up',
        trendClass: 'text-green-600'
      },
      {
        title: 'Traditional Approaches',
        description: 'Decreasing use of legacy systems and traditional methodologies.',
        trendValue: '-12%',
        trendDirection: 'down',
        trendClass: 'text-red-600'
      }
    ];
  }

  private generateSalaryInformation(): void {
    if (!this.selectedCareerPath) return;
    
    // In a real app, this would come from the API
    const baseTitle = this.selectedCareerPath.title;
    
    this.salaryInformation = [
      {
        position: `Junior ${baseTitle}`,
        range: '$60,000 - $80,000',
        growth: '3%',
        growthIndicator: 'up',
        growthClass: 'text-green-600'
      },
      {
        position: baseTitle,
        range: '$80,000 - $120,000',
        growth: '5%',
        growthIndicator: 'up',
        growthClass: 'text-green-600'
      },
      {
        position: `Senior ${baseTitle}`,
        range: '$120,000 - $150,000',
        growth: '7%',
        growthIndicator: 'up',
        growthClass: 'text-green-600'
      },
      {
        position: `Lead ${baseTitle}`,
        range: '$140,000 - $180,000',
        growth: '8%',
        growthIndicator: 'up',
        growthClass: 'text-green-600'
      }
    ];
  }

  private generateCareerTimeline(): void {
    if (!this.selectedCareerPath) return;
    
    const baseTitle = this.selectedCareerPath.title;
    const currentYear = new Date().getFullYear();
    
    this.careerTimeline = [
      {
        date: 'Now',
        title: baseTitle,
        description: `Continue building expertise as a ${baseTitle}.`,
        skills: this.selectedCareerPath.skillGaps.slice(0, 2),
        markerClass: 'bg-blue-500'
      },
      {
        date: `Q4 ${currentYear}`,
        title: 'Advanced Certification',
        description: 'Complete certification to enhance technical profile.',
        skills: this.selectedCareerPath.skillGaps.slice(2, 4),
        markerClass: 'bg-gray-300'
      },
      {
        date: `Q1 ${currentYear + 1}`,
        title: `Senior ${baseTitle}`,
        description: 'Promotion to senior role with more responsibilities.',
        skills: ['Leadership', 'Architecture'],
        markerClass: 'bg-gray-300'
      },
      {
        date: `Q3 ${currentYear + 2}`,
        title: 'Specialized Training',
        description: 'Advanced training in emerging technologies.',
        skills: ['Innovation', 'Modern Practices'],
        markerClass: 'bg-gray-300'
      },
      {
        date: `Q1 ${currentYear + 3}`,
        title: `Lead ${baseTitle}`,
        description: 'Promotion to leadership role with expanded responsibilities.',
        skills: ['Team Management', 'Strategy'],
        markerClass: 'bg-gray-300'
      }
    ];
  }

  getSkillBarClass(skill: SkillGap): string {
    const ratio = skill.current / skill.required;
    
    if (ratio >= 0.9) {
      return 'bg-green-500';
    } else if (ratio >= 0.7) {
      return 'bg-blue-500';
    } else if (ratio >= 0.5) {
      return 'bg-yellow-500';
    } else {
      return 'bg-red-500';
    }
  }

  private initGrowthChartIfDataAvailable(): void {
    if (!this.growthChartRef || !this.growthOpportunities.length) return;
    
    if (this.growthChart) {
      this.growthChart.destroy();
    }

    // Prepare data for chart
    const labels = this.growthOpportunities.map(item => item.skillName);
    const currentDemand = this.growthOpportunities.map(item => item.currentDemand);
    const projectedDemand = this.growthOpportunities.map(item => item.projectedDemand);
    const industryAverage = this.growthOpportunities.map(item => item.industryAverage);

    const canvas = this.growthChartRef.nativeElement.getContext('2d');
    this.growthChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Current Demand',
            data: currentDemand,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          },
          {
            label: 'Projected Demand (2 years)',
            data: projectedDemand,
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 1
          },
          {
            label: 'Industry Average',
            data: industryAverage,
            backgroundColor: 'rgba(107, 114, 128, 0.6)',
            borderColor: 'rgb(107, 114, 128)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Demand Level (%)' 
            }
          },
          x: {
            title: {
              display: true,
              text: 'Skills'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Skills Growth Opportunities'
          }
        }
      }
    });
  }
}
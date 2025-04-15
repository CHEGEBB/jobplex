// ai-career-path.component.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';

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
export class AiCareerPathComponent implements OnInit, AfterViewInit {
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
  careerPath: CareerPosition[] = [
    {
      title: 'Junior Developer',
      timeline: 'Past',
      description: 'Entry-level software development, focusing on bug fixes and small features.'
    },
    {
      title: 'Full-Stack Developer',
      timeline: 'Current',
      description: 'Building complete features and handling both front-end and back-end tasks.'
    },
    {
      title: 'Senior Developer',
      timeline: 'Next 1-2 years',
      description: 'Leading technical decisions and mentoring junior team members.'
    },
    {
      title: 'Tech Lead',
      timeline: '3-5 years',
      description: 'Directing technical strategy and managing development teams.'
    },
    {
      title: 'Engineering Manager',
      timeline: '5+ years',
      description: 'Overseeing multiple teams and driving organizational technical direction.'
    }
  ];
  
  // Skill Gap Analysis data
  skillGapAnalysis: SkillGap[] = [
    { name: 'JavaScript/TypeScript', current: 7, required: 9 },
    { name: 'Angular', current: 6, required: 8 },
    { name: 'Node.js', current: 5, required: 7 },
    { name: 'Database Design', current: 4, required: 8 },
    { name: 'DevOps', current: 3, required: 6 },
    { name: 'System Architecture', current: 3, required: 7 }
  ];
  
  // Growth Opportunities data
  growthOpportunities: GrowthOpportunity[] = [
    { skillName: 'AI/ML Integration', currentDemand: 65, projectedDemand: 95, industryAverage: 70 },
    { skillName: 'Cloud Architecture', currentDemand: 75, projectedDemand: 90, industryAverage: 80 },
    { skillName: 'DevOps', currentDemand: 70, projectedDemand: 85, industryAverage: 75 },
    { skillName: 'Security', currentDemand: 50, projectedDemand: 80, industryAverage: 60 },
    { skillName: 'API Design', currentDemand: 60, projectedDemand: 75, industryAverage: 65 }
  ];
  
  // Learning Resources data
  learningResources: LearningResource[] = [
    {
      title: 'Advanced Angular Development',
      type: 'Course',
      typeClass: 'bg-blue-100 text-blue-800',
      duration: '30 hours',
      description: 'Master advanced Angular concepts including state management and optimization.',
      link: '#'
    },
    {
      title: 'System Design for Senior Developers',
      type: 'Book',
      typeClass: 'bg-green-100 text-green-800',
      duration: '350 pages',
      description: 'Learn how to design scalable systems with modern architectural patterns.',
      link: '#'
    },
    {
      title: 'Tech Leadership Workshop',
      type: 'Workshop',
      typeClass: 'bg-purple-100 text-purple-800',
      duration: '2 days',
      description: 'Develop the soft skills needed to lead technical teams effectively.',
      link: '#'
    }
  ];
  
  // Industry Trends data
  industryTrends: IndustryTrend[] = [
    {
      title: 'AI Integration',
      description: 'Growing demand for developers who can integrate AI services into applications.',
      trendValue: '+45%',
      trendDirection: 'up',
      trendClass: 'text-green-600'
    },
    {
      title: 'Remote Work',
      description: 'Continued shift towards fully remote development teams and practices.',
      trendValue: '+30%',
      trendDirection: 'up',
      trendClass: 'text-green-600'
    },
    {
      title: 'Monolithic Architectures',
      description: 'Decreasing use of traditional monolithic application structures.',
      trendValue: '-15%',
      trendDirection: 'down',
      trendClass: 'text-red-600'
    }
  ];
  
  // Salary Information data
  salaryInformation: SalaryInfo[] = [
    {
      position: 'Junior Developer',
      range: '$60,000 - $80,000',
      growth: '3%',
      growthIndicator: 'up',
      growthClass: 'text-green-600'
    },
    {
      position: 'Full-Stack Developer',
      range: '$80,000 - $120,000',
      growth: '5%',
      growthIndicator: 'up',
      growthClass: 'text-green-600'
    },
    {
      position: 'Senior Developer',
      range: '$120,000 - $150,000',
      growth: '7%',
      growthIndicator: 'up',
      growthClass: 'text-green-600'
    },
    {
      position: 'Tech Lead',
      range: '$140,000 - $180,000',
      growth: '8%',
      growthIndicator: 'up',
      growthClass: 'text-green-600'
    },
    {
      position: 'Engineering Manager',
      range: '$150,000 - $220,000',
      growth: '10%',
      growthIndicator: 'up',
      growthClass: 'text-green-600'
    }
  ];
  
  // Career Timeline data
  careerTimeline: TimelineMilestone[] = [
    {
      date: 'Now',
      title: 'Full-Stack Developer',
      description: 'Continue building expertise in full-stack development.',
      skills: ['Angular', 'Node.js', 'SQL'],
      markerClass: 'bg-blue-500'
    },
    {
      date: 'Q4 2025',
      title: 'Advanced Certification',
      description: 'Complete cloud certification to enhance technical profile.',
      skills: ['Cloud', 'DevOps'],
      markerClass: 'bg-gray-300'
    },
    {
      date: 'Q1 2026',
      title: 'Senior Developer',
      description: 'Promotion to senior role with team leadership responsibilities.',
      skills: ['Leadership', 'Architecture'],
      markerClass: 'bg-gray-300'
    },
    {
      date: 'Q3 2027',
      title: 'Specialized Training',
      description: 'Advanced training in AI/ML integration for web applications.',
      skills: ['AI/ML', 'Data Science'],
      markerClass: 'bg-gray-300'
    },
    {
      date: 'Q1 2028',
      title: 'Tech Lead',
      description: 'Promotion to technical leadership role with expanded responsibilities.',
      skills: ['Team Management', 'Technical Strategy'],
      markerClass: 'bg-gray-300'
    }
  ];

  constructor() {}

  ngOnInit(): void {
    // Initialize any data or services here
    this.sidebarCollapsed = window.innerWidth < 768;

  }

  ngAfterViewInit(): void {
    this.initGrowthChart();
    
    // Add animation classes to skill bars after initial render
    setTimeout(() => {
      const skillBars = document.querySelectorAll('.skill-progress-bar');
      skillBars.forEach(bar => {
        bar.classList.add('animate-skill');
      });
    }, 300);
  }

  
  onToggleSidebar(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
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
    
    // Simulate AI thinking
    setTimeout(() => {
      // Add AI response (this would be replaced with actual API call in production)
      this.chatMessages.push({
        text: this.generateAIResponse(userQuery),
        sender: 'ai',
        timestamp: new Date()
      });
      
      // Scroll to bottom again
      setTimeout(() => {
        this.scrollChatToBottom();
      });
    }, 1000);
  }

  private scrollChatToBottom(): void {
    if (this.chatContainer) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }

  private generateAIResponse(query: string): string {
    // This is a simple simulation - in a real app, this would call an API
    const responses = [
      "Based on your current skills and career trajectory, focusing on cloud architecture would be beneficial for your next step toward becoming a Senior Developer.",
      "I recommend exploring the System Design course I've listed in the learning resources section. It aligns perfectly with your career goals.",
      "Your skill gap in DevOps is important to address as you move toward a Tech Lead position. Many organizations now expect technical leaders to have this knowledge.",
      "Current industry trends show a significant increase in demand for AI integration skills. This could be a valuable specialization to pursue.",
      "The timeline projection shows you could reach a Senior Developer role by early 2026 if you focus on the recommended learning path."
    ];
    
    // Return a random response
    return responses[Math.floor(Math.random() * responses.length)];
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

  private initGrowthChart(): void {
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
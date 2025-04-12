// interviews.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarEmployerComponent } from '../../../components/sidebar-employer/sidebar-employer.component';

interface Tab {
  id: string;
  name: string;
  icon: string;
}

interface Interviewer {
  id: number;
  name: string;
  avatar: string;
  role?: string;
  submitted?: boolean;
}

interface Candidate {
  id: number;
  name: string;
  avatar: string;
}

interface Interview {
  id: number;
  candidate: Candidate;
  position: string;
  date: string;
  time: string;
  type: string;
  status: string;
  stage: string;
  interviewers: Interviewer[];
}

interface CalendarDate {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: number;
  eventDetails: Array<{
    id: number;
    title: string;
    time: string;
    color: string;
  }>;
}

interface TeamMember {
  id: number;
  name: string;
  avatar: string;
  role: string;
  availability: string;
  skills: string[];
  upcomingInterviews: number;
  feedbackCompletion: number;
}

interface FeedbackItem {
  id: number;
  candidate: Candidate;
  position: string;
  interviewDate: string;
  interviewers: Array<Interviewer & { submitted: boolean }>;
  template: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'overdue';
  submittedCount: number;
  totalInterviewers: number;
  overallRating?: number;
}

interface InterviewType {
  id: string;
  name: string;
  description: string;
  icon: string;
  bgColor: string;
  iconClass: string;
  usage: number;
  avgDuration: string;
  completionRate: number;
  features: string[];
  progressColor: string;
  actionText: string;
  actionIcon: string;
  actionColor: string;
}

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarEmployerComponent],
  templateUrl: './interviews.component.html',
  styleUrls: ['./interviews.component.scss']
})
export class InterviewsComponent implements OnInit {
  // Tab navigation
  tabs: Tab[] = [
    { id: 'upcoming', name: 'Upcoming Interviews', icon: 'fa-calendar-alt' },
    { id: 'panel', name: 'Panel Coordination', icon: 'fa-users' },
    { id: 'feedback', name: 'Feedback Management', icon: 'fa-clipboard-check' },
    { id: 'types', name: 'Interview Types', icon: 'fa-list-alt' }
  ];
  activeTab: string = 'upcoming';

  // Filters
  searchTerm: string = '';
  statusFilter: string = 'all';
  feedbackFilter: string = 'all';
  
  // Calendar view toggle
  calendarView: boolean = true;
  
  // Calendar data
  calendarDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDates: CalendarDate[] = [];
  
  // Interviews data
  interviews: Interview[] = [];
  filteredInterviews: Interview[] = [];
  
  // Team members data
  teamMembers: TeamMember[] = [];
  
  // Feedback data
  feedbackItems: FeedbackItem[] = [];
  
  // Interview types data
  interviewTypes: InterviewType[] = [];
  
  // Modal controls
  showScheduleModal: boolean = false;
  selectedType: string = 'Video';
  
  constructor() { }

  ngOnInit(): void {
    this.generateMockData();
    this.filterInterviews();
    this.generateCalendarDates();
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  filterInterviews(): void {
    this.filteredInterviews = this.interviews.filter(interview => {
      // Filter by search term
      const searchMatch = !this.searchTerm || 
        interview.candidate.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        interview.position.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filter by status
      const statusMatch = this.statusFilter === 'all' || interview.status === this.statusFilter;
      
      return searchMatch && statusMatch;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.filterInterviews();
  }

  openScheduleModal(): void {
    this.showScheduleModal = true;
    document.body.classList.add('overflow-hidden');
  }

  closeScheduleModal(): void {
    this.showScheduleModal = false;
    document.body.classList.remove('overflow-hidden');
  }

  generateCalendarDates(): void {
    // This would normally come from a real calendar service
    // Mocking 35 days (5 weeks) for the calendar grid
    this.calendarDates = [];
    
    // Generate some days from previous month
    for (let i = 1; i <= 2; i++) {
      this.calendarDates.push({
        day: 30 + i - 2,
        isCurrentMonth: false,
        isToday: false,
        events: 0,
        eventDetails: []
      });
    }
    
    // Generate current month days
    for (let i = 1; i <= 30; i++) {
      const events = i % 7 === 2 || i % 7 === 5 || i === 15 || i === 22 ? Math.floor(Math.random() * 3) + 1 : 0;
      
      const eventDetails = [];
      for (let j = 0; j < events; j++) {
        const candidates = ['John Smith', 'Emma Johnson', 'Michael Brown', 'Sarah Davis'];
        const times = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];
        const colors = ['blue', 'green', 'purple', 'amber'];
        
        eventDetails.push({
          id: j + 1,
          title: candidates[Math.floor(Math.random() * candidates.length)],
          time: times[Math.floor(Math.random() * times.length)],
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      
      this.calendarDates.push({
        day: i,
        isCurrentMonth: true,
        isToday: i === 12, // Assuming today is the 12th
        events: events,
        eventDetails: eventDetails
      });
    }
    
    // Generate some days from next month to fill the grid
    const remainingDays = 35 - this.calendarDates.length;
    for (let i = 1; i <= remainingDays; i++) {
      this.calendarDates.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
        events: 0,
        eventDetails: []
      });
    }
  }

  generateMockData(): void {
    // Mock interviews data
    this.interviews = [
      {
        id: 1,
        candidate: {
          id: 101,
          name: 'John Smith',
          avatar: 'https://i.pravatar.cc/150?img=1'
        },
        position: 'Senior Frontend Developer',
        date: 'Apr 15, 2025',
        time: '10:00 AM',
        type: 'Video',
        status: 'confirmed',
        stage: 'Technical',
        interviewers: [
          { id: 201, name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?img=5', role: 'Tech Lead' },
          { id: 202, name: 'Mark Wilson', avatar: 'https://i.pravatar.cc/150?img=6', role: 'Senior Developer' },
          { id: 203, name: 'Amy Green', avatar: 'https://i.pravatar.cc/150?img=10', role: 'HR Manager' }
        ]
      },
      {
        id: 2,
        candidate: {
          id: 102,
          name: 'Emma Johnson',
          avatar: 'https://i.pravatar.cc/150?img=2'
        },
        position: 'UI/UX Designer',
        date: 'Apr 16, 2025',
        time: '02:30 PM',
        type: 'In-person',
        status: 'scheduled',
        stage: 'Final',
        interviewers: [
          { id: 204, name: 'David Brown', avatar: 'https://i.pravatar.cc/150?img=7', role: 'Design Director' },
          { id: 205, name: 'Sophie Turner', avatar: 'https://i.pravatar.cc/150?img=8', role: 'Product Manager' }
        ]
      },
      {
        id: 3,
        candidate: {
          id: 103,
          name: 'Michael Brown',
          avatar: 'https://i.pravatar.cc/150?img=3'
        },
        position: 'Backend Developer',
        date: 'Apr 18, 2025',
        time: '11:00 AM',
        type: 'Phone',
        status: 'pending',
        stage: 'Initial',
        interviewers: [
          { id: 206, name: 'Ryan Carter', avatar: 'https://i.pravatar.cc/150?img=9', role: 'Backend Lead' }
        ]
      },
      {
        id: 4,
        candidate: {
          id: 104,
          name: 'Sarah Davis',
          avatar: 'https://i.pravatar.cc/150?img=4'
        },
        position: 'Full Stack Developer',
        date: 'Apr 20, 2025',
        time: '03:00 PM',
        type: 'Video',
        status: 'scheduled',
        stage: 'HR',
        interviewers: [
          { id: 201, name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?img=5', role: 'Tech Lead' },
          { id: 203, name: 'Amy Green', avatar: 'https://i.pravatar.cc/150?img=10', role: 'HR Manager' }
        ]
      }
    ];
    
    // Set filtered interviews initially
    this.filteredInterviews = [...this.interviews];

    // Mock team members data
    this.teamMembers = [
      {
        id: 201,
        name: 'Jane Doe',
        avatar: 'https://i.pravatar.cc/150?img=5',
        role: 'Tech Lead',
        availability: 'Available',
        skills: ['JavaScript', 'React', 'System Design', 'Architecture'],
        upcomingInterviews: 4,
        feedbackCompletion: 92
      },
      {
        id: 202,
        name: 'Mark Wilson',
        avatar: 'https://i.pravatar.cc/150?img=6',
        role: 'Senior Developer',
        availability: 'Limited',
        skills: ['JavaScript', 'Angular', 'Node.js', 'MongoDB'],
        upcomingInterviews: 2,
        feedbackCompletion: 78
      },
      {
        id: 203,
        name: 'Amy Green',
        avatar: 'https://i.pravatar.cc/150?img=10',
        role: 'HR Manager',
        availability: 'Available',
        skills: ['Behavioral Assessment', 'Cultural Fit', 'Soft Skills'],
        upcomingInterviews: 5,
        feedbackCompletion: 95
      },
      {
        id: 204,
        name: 'David Brown',
        avatar: 'https://i.pravatar.cc/150?img=7',
        role: 'Design Director',
        availability: 'Unavailable',
        skills: ['UI/UX', 'Design Systems', 'User Research', 'Figma'],
        upcomingInterviews: 0,
        feedbackCompletion: 65
      },
      {
        id: 205,
        name: 'Sophie Turner',
        avatar: 'https://i.pravatar.cc/150?img=8',
        role: 'Product Manager',
        availability: 'Limited',
        skills: ['Product Strategy', 'Roadmapping', 'User Stories', 'Prioritization'],
        upcomingInterviews: 3,
        feedbackCompletion: 81
      },
      {
        id: 206,
        name: 'Ryan Carter',
        avatar: 'https://i.pravatar.cc/150?img=9',
        role: 'Backend Lead',
        availability: 'Available',
        skills: ['Java', 'SQL', 'Microservices', 'System Design'],
        upcomingInterviews: 1,
        feedbackCompletion: 87
      }
    ];
    
    // Mock feedback data
    this.feedbackItems = [
      {
        id: 301,
        candidate: {
          id: 105,
          name: 'Thomas Wilson',
          avatar: 'https://i.pravatar.cc/150?img=11'
        },
        position: 'DevOps Engineer',
        interviewDate: 'Apr 10, 2025',
        interviewers: [
          { id: 201, name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?img=5', role: 'Tech Lead', submitted: true },
          { id: 206, name: 'Ryan Carter', avatar: 'https://i.pravatar.cc/150?img=9', role: 'Backend Lead', submitted: false }
        ],
        template: 'Technical Assessment',
        dueDate: 'Apr 13, 2025',
        status: 'pending',
        submittedCount: 1,
        totalInterviewers: 2
      },
      {
        id: 302,
        candidate: {
          id: 106,
          name: 'Rachel Adams',
          avatar: 'https://i.pravatar.cc/150?img=12'
        },
        position: 'Product Designer',
        interviewDate: 'Apr 8, 2025',
        interviewers: [
          { id: 204, name: 'David Brown', avatar: 'https://i.pravatar.cc/150?img=7', role: 'Design Director', submitted: true },
          { id: 205, name: 'Sophie Turner', avatar: 'https://i.pravatar.cc/150?img=8', role: 'Product Manager', submitted: true },
          { id: 203, name: 'Amy Green', avatar: 'https://i.pravatar.cc/150?img=10', role: 'HR Manager', submitted: true }
        ],
        template: 'Design Assessment',
        dueDate: 'Apr 11, 2025',
        status: 'submitted',
        submittedCount: 3,
        totalInterviewers: 3,
        overallRating: 4.2
      },
      {
        id: 303,
        candidate: {
          id: 107,
          name: 'Alex Morgan',
          avatar: 'https://i.pravatar.cc/150?img=13'
        },
        position: 'Data Scientist',
        interviewDate: 'Apr 5, 2025',
        interviewers: [
          { id: 206, name: 'Ryan Carter', avatar: 'https://i.pravatar.cc/150?img=9', role: 'Backend Lead', submitted: false },
          { id: 202, name: 'Mark Wilson', avatar: 'https://i.pravatar.cc/150?img=6', role: 'Senior Developer', submitted: false }
        ],
        template: 'Technical Assessment',
        dueDate: 'Apr 8, 2025',
        status: 'overdue',
        submittedCount: 0,
        totalInterviewers: 2
      },
      {
        id: 304,
        candidate: {
          id: 108,
          name: 'Jason Lee',
          avatar: 'https://i.pravatar.cc/150?img=14'
        },
        position: 'Marketing Manager',
        interviewDate: 'Apr 7, 2025',
        interviewers: [
          { id: 203, name: 'Amy Green', avatar: 'https://i.pravatar.cc/150?img=10', role: 'HR Manager', submitted: true },
          { id: 205, name: 'Sophie Turner', avatar: 'https://i.pravatar.cc/150?img=8', role: 'Product Manager', submitted: true }
        ],
        template: 'General Assessment',
        dueDate: 'Apr 10, 2025',
        status: 'submitted',
        submittedCount: 2,
        totalInterviewers: 2,
        overallRating: 3.5
      }
    ];
    
    // Mock interview types data
    this.interviewTypes = [
      {
        id: 'video',
        name: 'Video Interview',
        description: 'Remote interviews via video conferencing',
        icon: 'fa-video',
        bgColor: 'rgba(59, 130, 246, 0.1)',
        iconClass: 'bg-blue-100 text-blue-600',
        usage: 65,
        avgDuration: '45 minutes',
        completionRate: 92,
        features: [
          'Screen sharing for technical demos',
          'Meeting recording with candidate consent',
          'Multiple interviewer support',
          'Calendar integration with Zoom, Meet, or Teams'
        ],
        progressColor: '#3b82f6',
        actionText: 'Schedule Video Interview',
        actionIcon: 'fa-plus-circle',
        actionColor: '#2563eb'
      },
      {
        id: 'in-person',
        name: 'In-Person Interview',
        description: 'Face-to-face interviews at office location',
        icon: 'fa-building',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        iconClass: 'bg-green-100 text-green-600',
        usage: 15,
        avgDuration: '1 hour',
        completionRate: 95,
        features: [
          'Office tour included',
          'Meeting room reservation',
          'Visitor badge automation',
          'Parking instructions for candidates'
        ],
        progressColor: '#10b981',
        actionText: 'Schedule In-Person Interview',
        actionIcon: 'fa-plus-circle',
        actionColor: '#059669'
      },
      {
        id: 'phone',
        name: 'Phone Interview',
        description: 'Initial screening calls with candidates',
        icon: 'fa-phone-alt',
        bgColor: 'rgba(124, 58, 237, 0.1)',
        iconClass: 'bg-purple-100 text-purple-600',
        usage: 12,
        avgDuration: '30 minutes',
        completionRate: 88,
        features: [
          'Auto-dialing to candidate',
          'Call recording with transcription',
          'Note-taking during interview',
          'Quick scoring template'
        ],
        progressColor: '#7c3aed',
        actionText: 'Schedule Phone Interview',
        actionIcon: 'fa-plus-circle',
        actionColor: '#6d28d9'
      },
      {
        id: 'async',
        name: 'Async Interview',
        description: 'Pre-recorded video responses from candidates',
        icon: 'fa-microphone-alt',
        bgColor: 'rgba(244, 63, 94, 0.1)',
        iconClass: 'bg-red-100 text-red-600',
        usage: 8,
        avgDuration: 'Flexible',
        completionRate: 75,
        features: [
          'Custom question sets',
          'Flexible completion timeline',
          'Team review of recordings',
          'AI-assisted response analysis'
        ],
        progressColor: '#f43f5e',
        actionText: 'Create Async Interview',
        actionIcon: 'fa-plus-circle',
        actionColor: '#e11d48'
      }
    ];
  }
}
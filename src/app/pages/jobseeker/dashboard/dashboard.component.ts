import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';

interface JobApplication {
  id: number;
  company: string;
  position: string;
  logo: string;
  status: 'Applied' | 'In Review' | 'Interview' | 'Offer' | 'Rejected';
  date: string;
  isFullTime: boolean;
  isRemote: boolean;
}

interface JobMatch {
  id: number;
  position: string;
  company: string;
  matchPercentage: number;
}

interface ActivityItem {
  id: number;
  company: string;
  type: 'View' | 'Application' | 'Interview';
  time: string;
  logo: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  sidebarCollapsed = false;
  profileData = {
    name: 'Elena Rodriguez',
    profileViews: 1240,
    applications: 45,
    interviews: 12,
    savedJobs: 28
  };
  
  recentActivity: ActivityItem[] = [
    { id: 1, company: 'Google', type: 'View', time: '2 hours ago', logo: 'google.svg' },
    { id: 2, company: 'Microsoft', type: 'Application', time: '1 day ago', logo: 'microsoft.svg' },
    { id: 3, company: 'Apple', type: 'Interview', time: '2 days ago', logo: 'apple.svg' }
  ];
  
  bestJobMatches: JobMatch[] = [
    { id: 1, position: 'Senior UX Designer', company: 'Figma', matchPercentage: 95 },
    { id: 2, position: 'Product Designer', company: 'Figma', matchPercentage: 89 },
    { id: 3, position: 'UI Engineer', company: 'Google', matchPercentage: 82 }
  ];
  
  recentApplications: JobApplication[] = [
    { 
      id: 1, 
      company: 'Dropbox', 
      position: 'Senior Product Designer',
      logo: 'dropbox.svg',
      status: 'In Review',
      date: '2 days ago',
      isFullTime: true,
      isRemote: true
    },
    { 
      id: 2, 
      company: 'Dropbox', 
      position: 'Senior Product Designer',
      logo: 'dropbox.svg',
      status: 'In Review',
      date: '2 days ago', 
      isFullTime: true,
      isRemote: true
    },
    { 
      id: 3, 
      company: 'Graphica', 
      position: 'Senior Product Designer',
      logo: 'graphica.svg',
      status: 'In Review',
      date: '2 days ago',
      isFullTime: true,
      isRemote: true
    },
    { 
      id: 4, 
      company: 'Dropbox', 
      position: 'Senior Product Designer',
      logo: 'dropbox.svg',
      status: 'In Review',
      date: '3 days ago',
      isFullTime: true,
      isRemote: true
    },
    { 
      id: 5, 
      company: 'Dropbox', 
      position: 'Senior Product Designer',
      logo: 'dropbox.svg',
      status: 'In Review',
      date: '3 days ago',
      isFullTime: true,
      isRemote: true
    },
    { 
      id: 6, 
      company: 'Graphica', 
      position: 'Senior Product Designer',
      logo: 'graphica.svg',
      status: 'In Review',
      date: '3 days ago',
      isFullTime: true,
      isRemote: true
    }
  ];
  
  upcomingInterviews = [
    {
      id: 1,
      company: 'Adobe',
      position: 'Product Designer',
      date: 'Tomorrow',
      time: '10:00 AM',
      type: 'Video Call',
      interviewers: [
        { name: 'Sarah Johnson', role: 'Design Lead' },
        { name: 'Michael Chen', role: 'UX Manager' }
      ]
    },
    {
      id: 2,
      company: 'Spotify',
      position: 'UI Designer',
      date: 'April 12, 2025',
      time: '2:30 PM',
      type: 'On-site',
      interviewers: [
        { name: 'Jessica White', role: 'Head of Design' },
        { name: 'Robert Davis', role: 'Senior Designer' }
      ]
    }
  ];
  
  recommendations = [
    {
      type: 'course',
      title: 'UI Animation Fundamentals',
      provider: 'Coursera',
      relevance: 'High',
      duration: '4 weeks'
    },
    {
      type: 'skill',
      title: 'Figma Prototyping',
      description: 'Advanced interactive prototyping techniques',
      relevance: 'Very High'
    },
    {
      type: 'certification',
      title: 'UX Design Professional Certificate',
      provider: 'Google',
      relevance: 'Medium',
      duration: '6 months'
    }
  ];

  ngOnInit() {
    // Check screen size for responsive sidebar
    this.sidebarCollapsed = window.innerWidth < 768;
  }

  onToggleSidebar(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Applied': return 'bg-blue-100 text-blue-800';
      case 'In Review': return 'bg-yellow-100 text-yellow-800';
      case 'Interview': return 'bg-purple-100 text-purple-800';
      case 'Offer': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
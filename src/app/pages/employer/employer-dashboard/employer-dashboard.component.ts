// employer-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarEmployerComponent } from '../../../components/sidebar-employer/sidebar-employer.component';

@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarEmployerComponent],
  templateUrl: './employer-dashboard.component.html',
  styleUrls: ['./employer-dashboard.component.scss']
})
export class EmployerDashboardComponent implements OnInit {
  employerName: string = 'Elizabeth Addams';
  profileCompletion: number = 75;
  Number = Number; // Make Number available in the template
  
  // Sample dashboard data
  dashboardStats = {
    activeJobs: 4,
    totalCandidates: 45,
    scheduledInterviews: 8,
    urgentActions: 3,
    perfectMatches: 12
  };
  
  // Recent candidates matched
  recentMatches = [
    { id: 1, name: 'John Developer', role: 'Frontend Developer', matchScore: 95, avatar: 'assets/avatar-1.png' },
    { id: 2, name: 'Lisa Designer', role: 'UI/UX Designer', matchScore: 92, avatar: 'assets/avatar-2.png' },
    { id: 3, name: 'Michael Engineer', role: 'Backend Engineer', matchScore: 88, avatar: 'assets/avatar-3.png' }
  ];
  
  // Upcoming interviews
  upcomingInterviews = [
    { id: 1, candidateName: 'Sarah Jones', role: 'Project Manager', date: '2025-04-14T10:00:00', isOnline: true },
    { id: 2, candidateName: 'Robert Smith', role: 'Data Analyst', date: '2025-04-14T14:30:00', isOnline: false },
    { id: 3, candidateName: 'Emily Clark', role: 'DevOps Engineer', date: '2025-04-15T11:00:00', isOnline: true }
  ];
  
  // Team activity
  recentActivities = [
    { id: 1, user: 'Mark', action: 'added a new job post', time: '2 hours ago', icon: 'fa-briefcase' },
    { id: 2, user: 'Jessica', action: 'scheduled an interview', time: '4 hours ago', icon: 'fa-calendar-check' },
    { id: 3, user: 'You', action: 'approved 3 candidates', time: '1 day ago', icon: 'fa-user-check' }
  ];
  
  // Job posting stats
  jobStats = [
    { label: 'Applications', value: 124, color: '#3f51b5', increase: true, percent: 15 },
    { label: 'Interviews', value: 28, color: '#00bcd4', increase: true, percent: 8 },
    { label: 'Offers', value: 6, color: '#4caf50', increase: false, percent: 3 },
    { label: 'Time to Hire', value: '12d', color: '#ff9800', increase: true, percent: 5 }
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialization code would go here, like loading real data from services
  }

  // Methods for handling actions
  viewAllMatches(): void {
    // Navigate to matches page
  }
  
  viewAllInterviews(): void {
    // Navigate to interviews page
  }
  
  createNewJobPost(): void {
    // Navigate to job creation page
  }

  formatInterviewDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' at ' + 
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
}
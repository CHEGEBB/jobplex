import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interfaces/auth.interface';

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

interface Skill {
  name: string;
  percentage: number;
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
  searchQuery = '';
  showProfileMenu = false;
  currentUser: User | null = null;
  
  // Use a generated profile image with user's initials if no profile image exists
  profileInitials: string = '';
  
  profileData = {
    name: '',
    profileViews: 1240,
    applications: 45,
    interviews: 12,
    savedJobs: 28,
    image: ''
  };
  
  skillsProgress: Skill[] = [
    { name: 'UI Design', percentage: 85 },
    { name: 'UX Research', percentage: 70 },
    { name: 'Prototyping', percentage: 90 },
    { name: 'User Testing', percentage: 65 }
  ];
  
  recentActivity: ActivityItem[] = [
    { id: 1, company: 'Google', type: 'View', time: '2 hours ago', logo: 'google.svg' },
    { id: 2, company: 'Microsoft', type: 'Application', time: '1 day ago', logo: 'microsoft.svg' },
    { id: 3, company: 'Apple', type: 'Interview', time: '2 days ago', logo: 'apple.svg' }
  ];
  
  bestJobMatches: JobMatch[] = [
    { id: 1, position: 'Senior UX Designer', company: 'Figma', matchPercentage: 95 },
    { id: 2, position: 'Product Designer', company: 'Adobe', matchPercentage: 89 },
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
      company: 'Custom', 
      position: 'UX Researcher',
      logo: '',
      status: 'Applied',
      date: '2 days ago', 
      isFullTime: true,
      isRemote: false
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
      company: 'Custom', 
      position: 'UI Designer',
      logo: '',
      status: 'Interview',
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

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Check screen size for responsive sidebar
    this.sidebarCollapsed = window.innerWidth < 768;
    
    // Get current user from AuthService
    this.currentUser = this.authService.getCurrentUser();
    
    // Update profile data with actual user information
    if (this.currentUser) {
      this.profileData.name = this.currentUser.firstName + ' ' + this.currentUser.lastName;
      
      // Generate initials for profile avatar if no image exists
      this.profileInitials = this.getInitials(this.currentUser.firstName, this.currentUser.lastName);
      
      // If user has a profile photo, use it, otherwise use a default image
      if (this.currentUser['profilePhoto']) {
        this.profileData.image = this.currentUser['profilePhoto'];
      } else {
        // Use a default image or generated avatar
        this.profileData.image = 'assets/ana.jpg'; // Default image as fallback
      }
    }
    
    // Subscribe to changes in authentication state
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.profileData.name = user.firstName + ' ' + user.lastName;
        this.profileInitials = this.getInitials(user.firstName, user.lastName);
        
        if (user['profilePhoto']) {
          this.profileData.image = user['profilePhoto'];
        }
      }
    });
  }

  // Helper method to get initials from name
  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const header = document.querySelector('.dashboard-header') as HTMLElement;
    
    if (window.scrollY > 0) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  @HostListener('window:click', ['$event'])
  onWindowClick(event: MouseEvent) {
    // Close profile menu when clicking outside
    if (this.showProfileMenu && !(event.target as HTMLElement).closest('.profile-menu')) {
      this.showProfileMenu = false;
    }
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

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    // Implement search functionality here
  }

  clearSearch() {
    this.searchQuery = '';
  }

  toggleProfileMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showProfileMenu = !this.showProfileMenu;
  }
  
  logout() {
    this.authService.logout();
    // Redirect to login page or home page
    // You might want to inject Router and use it here
  }
}
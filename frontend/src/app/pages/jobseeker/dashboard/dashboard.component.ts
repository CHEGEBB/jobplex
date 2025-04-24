import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { AuthService, User } from '../../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

// Interfaces
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
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  sidebarCollapsed = false;
  searchQuery = '';
  showProfileMenu = false;
  currentUser: User | null = null;
  profileInitials = '';
  hasProfilePhoto = false;

  profileData = {
    name: '',
    profileViews: 1240,
    applications: 45,
    interviews: 12,
    savedJobs: 28,
    profilePhoto: '' 
  };

  // Sample data arrays (keep your existing data)
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
      logo: 'assets/ux.svg',
      status: 'Applied',
      date: '2 days ago', 
      isFullTime: true,
      isRemote: false
    },
    { 
      id: 3, 
      company: 'Graphica', 
      position: 'Senior Product Designer',
      logo: 'graphic.svg',
      status: 'In Review',
      date: '2 days ago',
      isFullTime: true,
      isRemote: true
    },
    { 
      id: 4, 
      company: 'Custom', 
      position: 'UI Designer',
      logo: 'assets/ui.svg', 
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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.handleResponsiveLayout();
    this.initializeUserData();
    this.setupAuthSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleResponsiveLayout(): void {
    this.sidebarCollapsed = window.innerWidth < 768;
  }

  private initializeUserData(): void {
    const user = this.authService.currentUserValue;
    if (user) this.updateUserProfile(user);
  }

  private setupAuthSubscription(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) this.updateUserProfile(user);
      });
  }

  private updateUserProfile(user: User): void {
    this.profileData.name = `${user.firstName} ${user.lastName}`;
    this.profileInitials = this.getInitials(user.firstName, user.lastName);
    
    // Check if user has a profile photo
    if (user.profilePhoto && user.profilePhoto.trim() !== '') {
      this.profileData.profilePhoto = user.profilePhoto;
      this.hasProfilePhoto = true;
    } else {
      this.profileData.profilePhoto = '';
      this.hasProfilePhoto = false;
    }
  }

  private getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.sidebarCollapsed = window.innerWidth < 768;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const header = document.querySelector('.dashboard-header') as HTMLElement;
    header?.classList.toggle('scrolled', window.scrollY > 0);
  }

  @HostListener('window:click', ['$event'])
  onWindowClick(event: MouseEvent): void {
    if (this.showProfileMenu && !(event.target as HTMLElement).closest('.profile-menu')) {
      this.showProfileMenu = false;
    }
  }

  onToggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  getStatusClass(status: string): string {
    const statusClasses = {
      'Applied': 'bg-blue-100 text-blue-800',
      'In Review': 'bg-yellow-100 text-yellow-800',
      'Interview': 'bg-purple-100 text-purple-800',
      'Offer': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';
  }

  onSearchInput(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  toggleProfileMenu(event?: Event): void {
    event?.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
  }

  logout(): void {
    this.authService.logout();
  }
}
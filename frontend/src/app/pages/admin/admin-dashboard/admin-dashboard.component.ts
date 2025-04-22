import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

// Import SidebarAdmin component
import { SidebarAdminComponent } from '../../../components/sidebar-admin/sidebar-admin.component';
// Import AuthService
import { AuthService, User } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarAdminComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  // Current user
  currentUser: User | null = null;
  userInitials: string = '';
  
  // Profile dropdown state
  showProfileDropdown = false;
  
  // Charts
  activityChart: any;
  userGrowthChart: any;
  
  // Dropdowns state
  showActivityDropdown = false;
  showFilterDropdown = false;
  
  // System metrics placeholders (would come from a service in a real app)
  cpuUsage = 42;
  memoryUsage = 68;
  apiResponseTime = 128;
  dbLoad = 54;
  
  // Current filter selections
  currentActivityFilter = 'week';
  currentAlertFilter = 'all';
  
  // Alert system
  alerts = [
    { id: 1, type: 'security', title: 'Security: Unusual Login Patterns', description: 'Multiple failed login attempts detected from IP 203.45.78.105. Possible brute force attack.', time: '1h ago' },
    { id: 2, type: 'system', title: 'System: Database Storage High', description: 'Database storage utilization reached 85%. Consider scaling or clean-up operations.', time: '3h ago' },
    { id: 3, type: 'performance', title: 'Performance: API Response Time Increased', description: 'Average API response time increased to 230ms from baseline of 120ms.', time: '6h ago' }
  ];
  
  @ViewChild('activityDropdown') activityDropdownRef!: ElementRef;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Get the current user from auth service
    this.getCurrentUser();
    
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initActivityChart();
      this.initUserGrowthChart();
    }, 0);
    
    // Listen for clicks outside dropdowns to close them
    document.addEventListener('click', this.closeDropdowns.bind(this));
  }

  // Get current user from auth service
  getCurrentUser(): void {
    // First check if we already have the user in the service
    this.currentUser = this.authService.currentUserValue;
    
    if (this.currentUser) {
      this.generateUserInitials();
    } else {
      // If not, fetch the current user profile
      this.authService.getCurrentUserProfile().subscribe({
        next: (user) => {
          this.currentUser = user;
          this.generateUserInitials();
        },
        error: (error) => {
          console.error('Error fetching user profile:', error);
        }
      });
    }
  }

  // Generate user initials for the avatar
  generateUserInitials(): void {
    if (this.currentUser?.firstName && this.currentUser?.lastName) {
      this.userInitials = this.currentUser.firstName.charAt(0) + this.currentUser.lastName.charAt(0);
    } else if (this.currentUser?.email) {
      // If no name, use first letter of email
      this.userInitials = this.currentUser.email.charAt(0).toUpperCase();
    } else {
      this.userInitials = 'A'; // Default fallback
    }
  }

  // Logout user
  logout(): void {
    this.authService.logout();
  }

  // Toggle profile dropdown
  toggleProfileDropdown(event: Event): void {
    this.showProfileDropdown = !this.showProfileDropdown;
    // Close other dropdowns
    if (this.showProfileDropdown) {
      this.showActivityDropdown = false;
      this.showFilterDropdown = false;
    }
    event.stopPropagation();
  }

  // Initialize platform activity chart
  initActivityChart(): void {
    const ctx = document.getElementById('activityChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    this.activityChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Job Seekers',
            data: [65, 59, 80, 81, 56, 55, 72],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Employers',
            data: [28, 48, 40, 19, 36, 27, 40],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Job Posts',
            data: [12, 19, 17, 29, 18, 27, 34],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  // Initialize user growth chart
  initUserGrowthChart(): void {
    const ctx = document.getElementById('userGrowthChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    this.userGrowthChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Job Seekers',
            data: [540, 620, 750, 890, 960, 1020],
            backgroundColor: '#c026d3',
            borderRadius: 4
          },
          {
            label: 'Employers',
            data: [120, 150, 180, 220, 270, 300],
            backgroundColor: '#0ea5e9',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  // Dropdown toggle methods
  toggleActivityDropdown(event?: Event): void {
    this.showActivityDropdown = !this.showActivityDropdown;
    // Close other dropdowns
    if (this.showActivityDropdown) {
      this.showFilterDropdown = false;
      this.showProfileDropdown = false;
    }
    event?.stopPropagation();
  }

  toggleFilterDropdown(event?: Event): void {
    this.showFilterDropdown = !this.showFilterDropdown;
    // Close other dropdowns
    if (this.showFilterDropdown) {
      this.showActivityDropdown = false;
      this.showProfileDropdown = false;
    }
    event?.stopPropagation();
  }

  // Close dropdowns when clicking outside
  closeDropdowns(event: MouseEvent): void {
    if (!(event.target as Element).closest('#activityDropdown') && this.showActivityDropdown) {
      this.showActivityDropdown = false;
    }
    
    if (!(event.target as Element).closest('#filterDropdown') && this.showFilterDropdown) {
      this.showFilterDropdown = false;
    }
    
    if (!(event.target as Element).closest('#profileDropdown') && this.showProfileDropdown) {
      this.showProfileDropdown = false;
    }
  }

  // Filter methods
  filterActivity(period: string, event?: Event): void {
    event?.preventDefault();
    this.currentActivityFilter = period;
    this.showActivityDropdown = false;
    
    // Simulate data change based on filter
    let data1, data2, data3;
    
    if (period === 'day') {
      data1 = [42, 38, 45, 50, 36, 40, 48];
      data2 = [18, 22, 19, 26, 14, 18, 25];
      data3 = [8, 10, 7, 13, 9, 14, 16];
    } else if (period === 'week') {
      data1 = [65, 59, 80, 81, 56, 55, 72];
      data2 = [28, 48, 40, 19, 36, 27, 40];
      data3 = [12, 19, 17, 29, 18, 27, 34];
    } else { // month
      data1 = [320, 350, 400, 470, 520, 550, 620];
      data2 = [120, 140, 160, 190, 210, 240, 280];
      data3 = [50, 65, 80, 95, 110, 130, 150];
    }
    
    // Update chart with new data
    if (this.activityChart) {
      this.activityChart.data.datasets[0].data = data1;
      this.activityChart.data.datasets[1].data = data2;
      this.activityChart.data.datasets[2].data = data3;
      this.activityChart.update();
    }
  }

  filterAlerts(type: string, event?: Event): void {
    event?.preventDefault();
    this.currentAlertFilter = type;
    this.showFilterDropdown = false;
    // In a real app, this would filter the alerts array or fetch new data
    // For demo purposes, we'll just acknowledge the filter change
    console.log('Filtering alerts by:', type);
  }

  // Action methods for alerts
  handleAlert(type: string, id: number): void {
    console.log(`Handling ${type} alert with id ${id}`);
    // In a real app, this would open a detailed view or perform an action
  }

  dismissAlert(id: number): void {
    // Filter out the dismissed alert
    this.alerts = this.alerts.filter(alert => alert.id !== id);
  }

  // System metrics refresh
  refreshSystemMetrics(): void {
    // Simulate system metrics update
    this.cpuUsage = Math.floor(Math.random() * 30) + 30; // 30-60%
    this.memoryUsage = Math.floor(Math.random() * 30) + 50; // 50-80%
    this.apiResponseTime = Math.floor(Math.random() * 100) + 80; // 80-180ms
    this.dbLoad = Math.floor(Math.random() * 40) + 30; // 30-70%
    
    // Apply animations via class changes that would be styled in scss
    const elements = document.querySelectorAll('.metric-bar');
    elements.forEach(el => {
      el.classList.add('refreshing');
      setTimeout(() => el.classList.remove('refreshing'), 700);
    });
  }

  refreshAlerts(): void {
    // Simulate new alerts in a real app
    console.log('Refreshing alerts');
  }

  // View more actions
  viewAllAlerts(): void {
    // Navigate to alerts page in a real app
    console.log('Navigating to all alerts');
  }

  viewFeatureDetails(): void {
    // Navigate to feature details in a real app
    console.log('Navigating to feature details');
  }

  viewMaintenanceCalendar(): void {
    // Navigate to maintenance calendar in a real app
    console.log('Navigating to maintenance calendar');
  }

  // Card detail views
  showUserDetails(): void {
    console.log('Navigating to user details');
  }

  showJobDetails(): void {
    console.log('Navigating to job details');
  }

  showMatchDetails(): void {
    console.log('Navigating to match details');
  }

  showAIDetails(): void {
    console.log('Navigating to AI details');
  }
  
  // Navigate to profile page
  viewProfile(): void {
    // In a real app, this would navigate to the profile page
    console.log('Navigating to profile page');
  }
  
  // Navigate to settings page
  viewSettings(): void {
    // In a real app, this would navigate to the settings page
    console.log('Navigating to settings page');
  }
}
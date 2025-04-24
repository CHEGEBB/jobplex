import { Component, EventEmitter, HostListener, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-admin.component.html',
  styleUrls: ['./sidebar-admin.component.scss']
})
export class SidebarAdminComponent implements OnInit {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<boolean>();
  isMobile = false;
  darkMode = false;
  currentUser: User | null = null;
  userInitials: string = '';
  
  // Admin-specific navigation items
  primaryNavItems: NavItem[] = [
    { icon: 'fa-chart-pie', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: 'fa-users-cog', label: 'User Management', route: '/admin/user-management', badge: 5 },
    { icon: 'fa-shield-alt', label: 'Security', route: '/admin/security' },
  ];
  
  secondaryNavItems: NavItem[] = [
    { icon: 'fa-robot', label: 'AI Monitoring', route: '/admin/ai-monitoring' },
  ];
  
  systemNavItems: NavItem[] = [
    { icon: 'fa-tachometer-alt', label: 'System Metrics', route: '/admin/system-metrics' },
    { icon: 'fa-cog', label: 'Settings', route: '/admin/settings' },
  ];

  constructor(private authService: AuthService) {}

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close sidebar on outside click in mobile view
    if (this.isMobile && !this.collapsed) {
      const clickedElement = event.target as HTMLElement;
      const sidebarElement = document.querySelector('.sidebar-panel');
      const hamburgerElement = document.querySelector('.hamburger-btn');
      
      if (sidebarElement && 
          hamburgerElement && 
          !sidebarElement.contains(clickedElement) && 
          !hamburgerElement.contains(clickedElement)) {
        this.collapsed = true;
        this.toggleSidebar.emit(this.collapsed);
      }
    }
  }

  ngOnInit() {
    this.checkScreenSize();
    this.loadUserData();
    
    // Apply parallax effect to sidebar background on mouse movement
    if (typeof document !== 'undefined') {
      const sidebar = document.querySelector('.sidebar-panel');
      
      if (sidebar) {
        document.addEventListener('mousemove', (e) => {
          if (window.innerWidth >= 768) {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            const depth = 15;
            const moveX = (mouseX - 0.5) * depth;
            const moveY = (mouseY - 0.5) * depth;
            
            sidebar.querySelector<HTMLElement>(':scope::before')?.style.setProperty('transform', `translate(${moveX}px, ${moveY}px) scale(1.05)`);
          }
        });
      }
    }
  }

  loadUserData() {
    // Subscribe to the currentUser observable
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        // Generate initials from first and last name
        this.userInitials = this.generateInitials(user.firstName, user.lastName);
      }
    });
    
    // If no user is loaded yet, try fetching from the profile
    if (!this.currentUser) {
      this.authService.getCurrentUserProfile().subscribe(
        user => {
          this.currentUser = user;
          this.userInitials = this.generateInitials(user.firstName, user.lastName);
        },
        error => console.error('Error loading user profile:', error)
      );
    }
  }

  generateInitials(firstName: string, lastName: string): string {
    if (!firstName && !lastName) return 'A';
    return `${firstName ? firstName.charAt(0).toUpperCase() : ''}${lastName ? lastName.charAt(0).toUpperCase() : ''}`;
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile && !this.collapsed) {
      this.collapsed = true;
      this.toggleSidebar.emit(this.collapsed);
    }
  }

  toggle() {
    this.collapsed = !this.collapsed;
    this.toggleSidebar.emit(this.collapsed);
    
    // Animation for sidebar toggle
    const sidebar = document.querySelector('.sidebar-panel');
    if (sidebar) {
      sidebar.classList.add('transitioning');
      setTimeout(() => {
        sidebar.classList.remove('transitioning');
      }, 400);
    }
  }
  
  // Theme toggle function
  toggleTheme() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode');
    // Additional theme logic here
  }
}
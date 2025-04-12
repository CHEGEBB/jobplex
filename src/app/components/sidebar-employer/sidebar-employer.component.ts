// sidebar-employer.component.ts
import { Component, EventEmitter, HostListener, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar-employer',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-employer.component.html',
  styleUrls: ['./sidebar-employer.component.scss']
})
export class SidebarEmployerComponent implements OnInit {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<boolean>();
  isMobile = false;
  
  // Employer-specific navigation items
  primaryNavItems: NavItem[] = [
    { icon: 'fa-th-large', label: 'Dashboard', route: '/employer/dashboard' },
    { icon: 'fa-building', label: 'Company Profile', route: '/employer/profile' },
    { icon: 'fa-clipboard-list', label: 'Job Posts', route: '/employer/job-posts', badge: 3 },
    { icon: 'fa-users', label: 'Candidate Matches', route: '/employer/candidate-matches', badge: 12 },
    { icon: 'fa-comments', label: 'AI Chat Assistant', route: '/employer/chat-interface' },
  ];
  
  secondaryNavItems: NavItem[] = [
    { icon: 'fa-calendar-alt', label: 'Interviews', route: '/employer/interviews' },
    { icon: 'fa-cog', label: 'Settings', route: '/employer/settings' },
  ];

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
            
            const beforeElement = sidebar.querySelector(':before') as HTMLElement;
            if (beforeElement) {
              beforeElement.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
            }
          }
        });
      }
    }
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
    document.body.classList.toggle('dark-mode');
    // Additional theme logic here
  }
}
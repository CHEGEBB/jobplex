import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule,SidebarComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [
    trigger('rotateGear', [
      state('normal', style({ transform: 'rotate(0deg)' })),
      state('rotating', style({ transform: 'rotate(180deg)' })),
      transition('normal <=> rotating', animate('1s cubic-bezier(0.4, 0, 0.2, 1)'))
    ]),
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class SettingsComponent {
  sidebarCollapsed = false;
  activeTab = 'account';
  gearState = 'normal';
  themePreview = 'light';

  tabs = [
    { 
      id: 'account', 
      label: 'Account', 
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`
    },
    { 
      id: 'privacy', 
      label: 'Privacy & Data', 
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
    },
    { 
      id: 'appearance', 
      label: 'Appearance', 
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>`
    },
    { 
      id: 'accessibility', 
      label: 'Accessibility', 
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4M12 16h.01"></path></svg>`
    }
  ];

  userSettings = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY'
  };

  passwordForm = {
    current: '',
    new: '',
    confirm: ''
  };

  notificationSettings = [
    {
      name: 'Job Matches',
      items: [
        {
          label: 'New job matches',
          description: 'Get notified when new jobs matching your skills are posted',
          enabled: true
        },
        {
          label: 'Weekly job digests',
          description: 'Receive a weekly summary of job matches',
          enabled: true
        },
        {
          label: 'Salary insights',
          description: 'Get notifications about salary updates for your skills',
          enabled: false
        }
      ]
    },
    {
      name: 'Applications',
      items: [
        {
          label: 'Application status updates',
          description: 'Receive updates when your application status changes',
          enabled: true
        },
        {
          label: 'Application viewed by employer',
          description: 'Get notified when an employer views your application',
          enabled: true
        }
      ]
    },
    {
      name: 'Account',
      items: [
        {
          label: 'Security alerts',
          description: 'Get notified about important security updates',
          enabled: true
        },
        {
          label: 'Product updates',
          description: 'Receive news about new features and improvements',
          enabled: false
        }
      ]
    }
  ];

  privacySettings = {
    profileVisibility: 'employers',
    contactVisibility: 'private',
    searchEngineVisible: false
  };

  appearanceSettings = {
    theme: 'light',
    fontSize: 3
  };

  accessibilitySettings = {
    reducedMotion: false,
    highContrast: false,
    screenReader: false,
    textSpacing: 2
  };
  ngOnInit(): void {
    
    // Check screen size for responsive sidebar
    this.sidebarCollapsed = window.innerWidth < 768;
  }
  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    this.rotateGear();
  }

  rotateGear(): void {
    this.gearState = 'rotating';
    setTimeout(() => {
      this.gearState = 'normal';
    }, 1000);
  }

  onToggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
  saveSettings(): void {
    // Here you would implement the logic to save all settings
    console.log('Saving settings...');
    
    // Show save animation
    this.rotateGear();
    
    // In a real app, you would make API calls here
    setTimeout(() => {
      console.log('Settings saved!');
      // Show success notification or feedback
    }, 1000);
  }
}
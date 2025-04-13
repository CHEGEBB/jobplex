import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { SidebarAdminComponent } from '../../../components/sidebar-admin/sidebar-admin.component';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule,SidebarAdminComponent],
  animations: [
    trigger('notificationAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ])
  ]
})
export class SecurityComponent implements OnInit {
  selectedSection: string = 'authentication';
  showNotification: boolean = false;
  notificationMessage: string = '';
  activityFilter: string = 'all';
  showIpRestrictionModal: boolean = false;

  // Authentication settings
  settings = {
    tfaEnabled: true,
    tfaForAdmins: true,
    tfaForEmployers: false,
    tfaForJobSeekers: false,
    tfaMethod: 'app',
    advancedSessionControls: true,
    sessionTimeout: 30,
    maxConcurrentSessions: '2',
    forceLogoutOnPasswordChange: true,
    ssoEnabled: true,
    googleSso: true,
    microsoftSso: false,
    linkedinSso: true,
    captchaEnabled: true,
    captchaOnLogin: true,
    captchaOnRegister: true,
    captchaOnPasswordReset: true,
    captchaType: 'recaptcha'
  };

  // Password policies
  passwordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false,
    expirationEnabled: true,
    expirationDays: '90',
    expirationNotice: '7',
    preventReuse: true,
    previousPasswordsCount: '5',
    lockoutEnabled: true,
    maxFailedAttempts: '5',
    lockoutDuration: '30',
    notifyAdminOnLockout: true,
    progressiveLockout: false,
    mfaAdmins: 'required',
    mfaEmployers: 'optional',
    mfaJobSeekers: 'optional',
    mfaAppEnabled: true,
    mfaSmsEnabled: true,
    mfaEmailEnabled: true
  };

  // Security logs
  securityLogs = [
    {
      id: 1,
      event: 'Failed login attempt',
      user: 'sarah.johnson@example.com',
      ip: '192.168.1.105',
      location: 'New York, USA',
      timestamp: '2025-04-13 09:45:22',
      status: 'suspicious',
      icon: 'fas fa-exclamation-circle'
    },
    {
      id: 2,
      event: 'Password changed',
      user: 'admin@jobplex.com',
      ip: '192.168.1.101',
      location: 'San Francisco, USA',
      timestamp: '2025-04-13 08:30:15',
      status: 'normal',
      icon: 'fas fa-key'
    },
    {
      id: 3,
      event: 'Admin login',
      user: 'admin@jobplex.com',
      ip: '192.168.1.101',
      location: 'San Francisco, USA',
      timestamp: '2025-04-13 08:25:10',
      status: 'normal',
      icon: 'fas fa-sign-in-alt'
    },
    {
      id: 4,
      event: 'Security setting changed',
      user: 'admin@jobplex.com',
      ip: '192.168.1.101',
      location: 'San Francisco, USA',
      timestamp: '2025-04-12 17:12:33',
      status: 'normal',
      icon: 'fas fa-shield-alt'
    },
    {
      id: 5,
      event: 'Multiple failed login attempts',
      user: 'employer123@company.com',
      ip: '203.0.113.45',
      location: 'Unknown',
      timestamp: '2025-04-12 15:40:22',
      status: 'suspicious',
      icon: 'fas fa-exclamation-circle'
    },
    {
      id: 6,
      event: 'Account locked',
      user: 'employer123@company.com',
      ip: '203.0.113.45',
      location: 'Unknown',
      timestamp: '2025-04-12 15:40:40',
      status: 'warning',
      icon: 'fas fa-user-lock'
    },
    {
      id: 7,
      event: 'Login from new location',
      user: 'recruiter@techjobs.com',
      ip: '45.123.45.67',
      location: 'London, UK',
      timestamp: '2025-04-12 14:22:18',
      status: 'warning',
      icon: 'fas fa-map-marker-alt'
    }
  ];

  // IP restrictions
  ipRestrictions = [
    {
      id: 1,
      type: 'block',
      ip: '203.0.113.0/24',
      appliedTo: 'All Users',
      addedBy: 'admin@jobplex.com',
      expiration: '2025-05-15',
      active: true
    },
    {
      id: 2,
      type: 'allow',
      ip: '192.168.1.101',
      appliedTo: 'Administrators Only',
      addedBy: 'admin@jobplex.com',
      expiration: null,
      active: true
    },
    {
      id: 3,
      type: 'block',
      ip: '45.123.45.0/24',
      appliedTo: 'All Users',
      addedBy: 'system',
      expiration: null,
      active: false
    }
  ];

  // New IP rule
  newIpRule = {
    type: 'block',
    ip: '',
    appliedTo: 'all',
    hasExpiration: false,
    expirationDate: '',
    note: ''
  };

  constructor() { }

  ngOnInit(): void {
  }

  get filteredLogs() {
    if (this.activityFilter === 'all') {
      return this.securityLogs;
    }
    return this.securityLogs.filter(log => log.status === this.activityFilter || 
      (this.activityFilter === 'login' && log.event.toLowerCase().includes('login')) ||
      (this.activityFilter === 'settings' && log.event.toLowerCase().includes('setting')));
  }

  setActiveSection(section: string): void {
    this.selectedSection = section;
  }

  toggleSetting(setting: string): void {
    // @ts-ignore: Object is possibly 'null'
    this.settings[setting] = !this.settings[setting];
    this.showToast(`Setting "${setting}" has been updated`);
  }

  viewLogDetails(log: any): void {
    // In a real application, this would show a detailed view or modal
    console.log('Viewing log details:', log);
  }

  markAsReviewed(log: any): void {
    log.status = 'reviewed';
    this.showToast('Security event marked as reviewed');
  }

  toggleIpRule(rule: any): void {
    rule.active = !rule.active;
    this.showToast(`IP rule ${rule.active ? 'activated' : 'deactivated'}`);
  }

  editIpRule(rule: any): void {
    // In a real application, this would open a modal with the rule details
    console.log('Editing IP rule:', rule);
  }

  deleteIpRule(rule: any): void {
    this.ipRestrictions = this.ipRestrictions.filter(r => r.id !== rule.id);
    this.showToast('IP restriction rule deleted');
  }

  addIpRule(): void {
    const newRule = {
      id: this.ipRestrictions.length + 1,
      type: this.newIpRule.type,
      ip: this.newIpRule.ip,
      appliedTo: this.getAppliedToLabel(this.newIpRule.appliedTo),
      addedBy: 'admin@jobplex.com',
      expiration: this.newIpRule.hasExpiration ? this.newIpRule.expirationDate : null,
      active: true
    };

    this.ipRestrictions.unshift(newRule);
    this.showIpRestrictionModal = false;
    this.showToast('New IP restriction rule added');

    // Reset form
    this.newIpRule = {
      type: 'block',
      ip: '',
      appliedTo: 'all',
      hasExpiration: false,
      expirationDate: '',
      note: ''
    };
  }

  getAppliedToLabel(value: string): string {
    const labels = {
      'all': 'All Users',
      'admins': 'Administrators Only',
      'employers': 'Employers Only',
      'jobseekers': 'Job Seekers Only'
    };
    return labels[value as keyof typeof labels];
  }

  savePasswordPolicies(): void {
    // In a real app, this would call an API to save the policies
    console.log('Saving password policies:', this.passwordPolicy);
    this.showToast('Password policies have been updated');
  }

  getPasswordStrengthClass(): string {
    const strength = this.calculatePasswordStrength();
    if (strength < 40) return 'weak';
    if (strength < 70) return 'medium';
    return 'strong';
  }

  getPasswordStrengthLabel(): string {
    const strength = this.calculatePasswordStrength();
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  }

  calculatePasswordStrength(): number {
    let strength = 0;
    
    // Base score from length
    strength += this.passwordPolicy.minLength * 4;
    
    // Additional criteria
    if (this.passwordPolicy.requireUppercase) strength += 15;
    if (this.passwordPolicy.requireLowercase) strength += 10;
    if (this.passwordPolicy.requireNumbers) strength += 15;
    if (this.passwordPolicy.requireSymbols) strength += 20;
    
    // Cap at 100
    return Math.min(strength, 100);
  }

  showToast(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;

    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }
}
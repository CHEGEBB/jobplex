import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SidebarEmployerComponent } from '../../../components/sidebar-employer/sidebar-employer.component';

@Component({
  selector: 'app-employer-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SidebarEmployerComponent
  ],
  templateUrl: './employer-settings.component.html',
  styleUrls: ['./employer-settings.component.scss']
})
export class EmployerSettingsComponent implements OnInit {
  // Forms
  profileForm!: FormGroup;
  notificationForm!: FormGroup;
  passwordForm!: FormGroup;

  // Form submission flags
  profileFormSubmitted = false;
  notificationFormSubmitted = false;
  passwordFormSubmitted = false;

  // Modal visibility flags
  showChangePasswordModal = false;
  showDeleteAccountModal = false;

  // Security settings
  isTwoFactorEnabled = false;

  // Password strength indicators
  passwordStrengthClass = '';
  passwordStrengthText = '';

  // Delete account confirmation
  deleteConfirmationText = '';

  // Industry options
  industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Hospitality',
    'Construction',
    'Entertainment',
    'Transportation',
    'Legal Services',
    'Marketing',
    'Agriculture',
    'Energy',
    'Real Estate'
  ];

  // Subscription plan details
  currentPlan = {
    name: 'Professional',
    description: 'Advanced recruiting tools and features',
    features: [
      'Unlimited job postings',
      'Advanced candidate filtering',
      'AI matching priority',
      'Interview scheduling tools',
      'Analytics dashboard'
    ]
  };

  // Billing history
  billingHistory = [
    {
      date: new Date('2025-03-12'),
      description: 'Professional Plan - Monthly',
      amount: 99.99,
      status: 'Paid'
    },
    {
      date: new Date('2025-02-12'),
      description: 'Professional Plan - Monthly',
      amount: 99.99,
      status: 'Paid'
    },
    {
      date: new Date('2025-01-12'),
      description: 'Professional Plan - Monthly',
      amount: 99.99,
      status: 'Paid'
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForms();
    this.loadUserData();
  }

  initForms(): void {
    // Profile form
    this.profileForm = this.fb.group({
      companyName: ['', Validators.required],
      industry: [''],
      contactEmail: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      companyWebsite: ['']
    });

    // Notification settings form
    this.notificationForm = this.fb.group({
      applicationUpdates: [true],
      interviewReminders: [true],
      candidateRecommendations: [true],
      systemUpdates: [false],
      emailFrequency: ['daily']
    });

    // Password form
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Monitor password changes to update strength indicator
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(
      (password) => this.updatePasswordStrength(password)
    );
  }

  loadUserData(): void {
    // Mock data instead of fetching from a service
    const mockData = {
      companyName: 'Acme Corporation',
      industry: 'Technology',
      contactEmail: 'contact@acmecorp.com',
      phoneNumber: '(555) 123-4567',
      companyWebsite: 'https://www.acmecorp.com',
      notificationPreferences: {
        applicationUpdates: true,
        interviewReminders: true,
        candidateRecommendations: true,
        systemUpdates: false,
        emailFrequency: 'daily'
      },
      securitySettings: {
        twoFactorEnabled: false
      }
    };

    // Populate the form with mock user data
    this.profileForm.patchValue({
      companyName: mockData.companyName,
      industry: mockData.industry,
      contactEmail: mockData.contactEmail,
      phoneNumber: mockData.phoneNumber,
      companyWebsite: mockData.companyWebsite
    });

    // Set notification preferences
    this.notificationForm.patchValue({
      applicationUpdates: mockData.notificationPreferences?.applicationUpdates ?? true,
      interviewReminders: mockData.notificationPreferences?.interviewReminders ?? true,
      candidateRecommendations: mockData.notificationPreferences?.candidateRecommendations ?? true,
      systemUpdates: mockData.notificationPreferences?.systemUpdates ?? false,
      emailFrequency: mockData.notificationPreferences?.emailFrequency ?? 'daily'
    });

    // Set security settings
    this.isTwoFactorEnabled = mockData.securitySettings?.twoFactorEnabled ?? false;
  }

  saveProfileChanges(): void {
    this.profileFormSubmitted = true;
    
    if (this.profileForm.valid) {
      // In a real app, you'd send this to your backend
      console.log('Profile form values:', this.profileForm.value);
      
      // Show success message (would use a toast service in a real app)
      alert('Profile updated successfully');
      this.profileFormSubmitted = false;
    }
  }

  saveNotificationSettings(): void {
    this.notificationFormSubmitted = true;
    
    if (this.notificationForm.valid) {
      // In a real app, you'd send this to your backend
      console.log('Notification form values:', this.notificationForm.value);
      
      // Show success message (would use a toast service in a real app)
      alert('Notification preferences saved');
      this.notificationFormSubmitted = false;
    }
  }

  // Password validation and management
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ matching: true });
      return { matching: true };
    } else {
      return null;
    }
  }

  updatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrengthClass = '';
      this.passwordStrengthText = '';
      return;
    }

    // Simple password strength calculation
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character type checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Set class and text based on strength
    if (strength <= 2) {
      this.passwordStrengthClass = 'weak';
      this.passwordStrengthText = 'Weak';
    } else if (strength <= 4) {
      this.passwordStrengthClass = 'medium';
      this.passwordStrengthText = 'Medium';
    } else {
      this.passwordStrengthClass = 'strong';
      this.passwordStrengthText = 'Strong';
    }
  }

  changePassword(): void {
    this.passwordFormSubmitted = true;
    
    if (this.passwordForm.valid) {
      // In a real app, you'd send this to your backend
      console.log('Password form values:', this.passwordForm.value);
      
      // Show success message (would use a toast service in a real app)
      alert('Password changed successfully');
      this.closeModals();
      this.passwordForm.reset();
      this.passwordFormSubmitted = false;
    }
  }

  // Toggle two-factor authentication
  toggle2FASettings(): void {
    this.isTwoFactorEnabled = !this.isTwoFactorEnabled;
    
    // In a real app, you'd send this to your backend
    console.log('Two-factor authentication:', this.isTwoFactorEnabled);
    
    // Show success message (would use a toast service in a real app)
    const message = this.isTwoFactorEnabled ? 
      'Two-factor authentication enabled' : 
      'Two-factor authentication disabled';
      
    alert(message);
  }

  // Account deletion
  deleteAccount(): void {
    if (this.deleteConfirmationText === 'DELETE') {
      // In a real app, you'd send this to your backend
      console.log('Account deletion requested');
      
      // Show success message (would use a toast service in a real app)
      alert('Your account has been deleted');
      
      // Redirect to the homepage or login page in a real app
      setTimeout(() => {
        alert('Redirecting to homepage...');
        // window.location.href = '/';
      }, 2000);
    }
  }

  // Modal management
  openChangePasswordModal(): void {
    this.showChangePasswordModal = true;
    this.passwordForm.reset();
    this.passwordFormSubmitted = false;
  }

  openDeleteAccountModal(): void {
    this.showDeleteAccountModal = true;
    this.deleteConfirmationText = '';
  }

  openDataVisibilitySettings(): void {
    // Implement data visibility settings modal or navigation
    alert('Data visibility settings will be available soon');
  }

  openUpgradeModal(): void {
    // Implement subscription upgrade modal or navigation
    alert('Subscription upgrade will be available soon');
  }

  openCancelSubscriptionModal(): void {
    // Implement subscription cancellation modal
    alert('Subscription management will be available soon');
  }

  closeModals(event?: any): void {
    // Close modal only if clicking on overlay or close button
    if (!event || event.target.classList.contains('modal-overlay') || event.target.closest('.close-btn')) {
      this.showChangePasswordModal = false;
      this.showDeleteAccountModal = false;
    }
  }
}
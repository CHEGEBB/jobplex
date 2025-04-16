// src/app/pages/auth-screen/auth-screen.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-screen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-screen.component.html',
  styleUrls: ['./auth-screen.component.scss']
})
export class AuthScreenComponent implements OnInit, OnDestroy {
  // Form Management
  loginForm: FormGroup;
  signupForm: FormGroup;
  authMode: 'login' | 'signup' = 'login';
  selectedRole: 'jobseeker' | 'employer' | 'admin' = 'jobseeker';
  showPassword = false;
  isLoading = false;
  passwordStrength = '';
  errorMessage = '';
  successMessage = '';

  // Slideshow Management
  slides = [
    // Jobseeker slides (index 0-2)
    {
      image: 'assets/seeker1.jpg',
      title: 'Find Your Dream Job',
      description: 'Connect with opportunities that match your skills and aspirations.'
    },
    {
      image: 'assets/seeker2.jpg',
      title: 'Build Your Career',
      description: 'Take the next step in your professional journey with personalized matches.'
    },
    {
      image: 'assets/man.jpg',
      title: 'Discover Your Potential',
      description: 'Uncover new possibilities with AI-powered skill matching.'
    },
    // Employer slides (index 3-5)
    {
      image: 'assets/employer.jpg',
      title: 'Hire Top Talent',
      description: 'Find candidates that perfectly match your requirements.'
    },
    {
      image: 'assets/employer2.jpg',
      title: 'Streamline Your Hiring',
      description: 'Leverage AI to identify the perfect candidates faster.'
    },
    {
      image: 'assets/employer3.jpg',
      title: 'Empower Your Team',
      description: 'Build a strong team with the right talent.'
    },
    // Admin slides (index 6-7)
    {
      image: 'assets/admin.jpg',
      title: 'Manage Your Platform',
      description: 'Powerful tools for administrators to oversee the entire ecosystem.'
    },
    {
      image: 'assets/admin2.jpg',
      title: 'Optimize Performance',
      description: 'Gain insights and analytics to enhance platform efficiency.'
    }
  ];
  currentSlide = 0;
  private slideSubscription: Subscription | null = null;
  
  // Role-specific content
  roleContent = {
    jobseeker: {
      slides: [0, 1, 2],
      welcomeText: 'Your skills. Your future. One platform.'
    },
    employer: {
      slides: [3, 4, 5],
      welcomeText: 'Find the perfect candidates for your team.'
    },
    admin: {
      slides: [6, 7],
      welcomeText: 'Manage and optimize the entire platform.'
    }
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      companyName: [''],
      termsAgreement: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.startSlideshow();
    this.updateRoleValidation();
    this.signupForm.get('password')?.valueChanges.subscribe(value => {
      this.checkPasswordStrength(value);
    });

    // Check if already authenticated and redirect accordingly
    if (this.authService.isAuthenticated()) {
      const userRole = this.authService.getUserRole();
      if (userRole) {
        this.router.navigate([`/${userRole}/dashboard`]);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.slideSubscription) {
      this.slideSubscription.unsubscribe();
    }
  }

  startSlideshow(): void {
    // Start automatic slideshow
    this.slideSubscription = interval(6000).subscribe(() => {
      this.nextSlide();
    });
  }

  nextSlide(): void {
    const roleSlides = this.roleContent[this.selectedRole].slides;
    const currentIndex = roleSlides.indexOf(this.currentSlide);
    const nextIndex = (currentIndex + 1) % roleSlides.length;
    this.currentSlide = roleSlides[nextIndex];
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  checkPasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = '';
      return;
    }

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;

    const criteria = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    if (length < 8 || criteria < 2) {
      this.passwordStrength = 'weak';
    } else if (length >= 8 && criteria === 2) {
      this.passwordStrength = 'medium';
    } else if (length >= 8 && criteria >= 3) {
      this.passwordStrength = 'strong';
    }
  }

  setAuthMode(mode: 'login' | 'signup'): void {
    this.authMode = mode;
    this.clearMessages();
  }

  changeRole(role: 'jobseeker' | 'employer' | 'admin'): void {
    this.selectedRole = role;
    this.updateRoleValidation();
    
    // Reset to first slide of the role
    this.currentSlide = this.roleContent[role].slides[0];
    
    // Reset forms when changing roles
    this.loginForm.reset({ rememberMe: false });
    this.signupForm.reset({ termsAgreement: false });
    this.clearMessages();
  }

  updateRoleValidation(): void {
    const companyNameControl = this.signupForm.get('companyName');
    
    if (this.selectedRole === 'employer') {
      companyNameControl?.setValidators(Validators.required);
    } else {
      companyNameControl?.clearValidators();
      companyNameControl?.setValue('');
    }
    
    companyNameControl?.updateValueAndValidity();
  }

  getRoleText(): string {
    return this.roleContent[this.selectedRole].welcomeText;
  }

  getRoleClass(): string {
    return `${this.selectedRole}-overlay`;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    
    this.clearMessages();
    this.isLoading = true;
    
    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      role: this.selectedRole
    };
    
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Navigate based on role
          this.router.navigate([`/${this.selectedRole}/dashboard`]);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Login failed. Please check your credentials.';
      }
    });
  }

  onSignup(): void {
    if (this.signupForm.invalid) return;
    
    this.clearMessages();
    this.isLoading = true;
    
    const signupData = {
      firstName: this.signupForm.value.firstName,
      lastName: this.signupForm.value.lastName,
      email: this.signupForm.value.email,
      password: this.signupForm.value.password,
      role: this.selectedRole,
      companyName: this.selectedRole === 'employer' ? this.signupForm.value.companyName : undefined
    };
    
    this.authService.register(signupData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Registration successful! Please login with your credentials.';
          this.authMode = 'login';
          this.loginForm.patchValue({
            email: signupData.email,
            password: ''
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Registration failed. Please try again.';
      }
    });
  }

  loginWithGoogle(): void {
    this.clearMessages();
    this.isLoading = true;
    
    this.authService.loginWithGoogle(this.selectedRole).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate([`/${this.selectedRole}/dashboard`]);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Google login failed. Please try again.';
      }
    });
  }

  loginWithLinkedIn(): void {
    this.clearMessages();
    this.isLoading = true;
    
    this.authService.loginWithLinkedIn(this.selectedRole).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate([`/${this.selectedRole}/dashboard`]);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'LinkedIn login failed. Please try again.';
      }
    });
  }

  signupWithGoogle(): void {
    this.loginWithGoogle(); // Reuse the same flow
  }

  signupWithLinkedIn(): void {
    this.loginWithLinkedIn(); // Reuse the same flow
  }

  goToForgotPassword(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/forgot-password']);
  }
}
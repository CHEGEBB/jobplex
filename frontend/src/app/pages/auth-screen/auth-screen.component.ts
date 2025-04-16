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
    }
    ,
    // Admin slides (index 6-7)
    {
      image: 'assets/admin.jpg',
      title: 'Manage Your Platform',
      description: 'Powerful tools for administrators to oversee the entire ecosystem.'
    },
    {
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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
      slides: [3, 4,5],
      welcomeText: 'Find the perfect candidates for your team.'
    },
    admin: {
      slides: [6,7],
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
  }

  changeRole(role: 'jobseeker' | 'employer' | 'admin'): void {
    this.selectedRole = role;
    this.updateRoleValidation();
    
    // Reset to first slide of the role
    this.currentSlide = this.roleContent[role].slides[0];
    
    // Reset forms when changing roles
    this.loginForm.reset({ rememberMe: false });
    this.signupForm.reset({ termsAgreement: false });
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

  onLogin(): void {
    if (this.loginForm.invalid) return;
    
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      console.log('Login with:', this.loginForm.value, 'Role:', this.selectedRole);
      
      // Navigate based on role
      if (this.selectedRole === 'jobseeker') {
        this.router.navigate(['/jobseeker/dashboard']);
      } else if (this.selectedRole === 'employer') {
        this.router.navigate(['/employer/dashboard']);
      } else {
        this.router.navigate(['/admin/dashboard']);
      }
    }, 1500);
  }

  onSignup(): void {
    if (this.signupForm.invalid) return;
    
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      console.log('Signup with:', this.signupForm.value, 'Role:', this.selectedRole);
      
      // Navigate based on role
      if (this.selectedRole === 'jobseeker') {
        this.router.navigate(['/jobseeker/dashboard']);
      } else if (this.selectedRole === 'employer') {
        this.router.navigate(['/employer/dashboard']);
      } else {
        this.router.navigate(['/admin/dashboard']);
      }
    }, 1500);
  }

  loginWithGoogle(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      console.log('Login with Google for role:', this.selectedRole);
      // Navigate based on role after Google authentication
    }, 1500);
  }

  loginWithLinkedIn(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      console.log('Login with LinkedIn for role:', this.selectedRole);
      // Navigate based on role after LinkedIn authentication
    }, 1500);
  }

  signupWithGoogle(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      console.log('Signup with Google for role:', this.selectedRole);
      // Navigate based on role after Google authentication
    }, 1500);
  }

  signupWithLinkedIn(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      console.log('Signup with LinkedIn for role:', this.selectedRole);
      // Navigate based on role after LinkedIn authentication
    }, 1500);
  }

  goToForgotPassword(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/forgot-password']);
  }
}
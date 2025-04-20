import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, interval, finalize, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService, AuthResponse, RegisterRequest } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-auth-screen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-screen.component.html',
  styleUrls: ['./auth-screen.component.scss']
})
export class AuthScreenComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  signupForm: FormGroup;
  authMode: 'login' | 'signup' = 'login';
  selectedRole: 'jobseeker' | 'employer' | 'admin' = 'jobseeker';
  showPassword = false;
  isLoading = false;
  passwordStrength = '';
  errorMessage = '';
  successMessage = '';

  slides = [
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
  
  roleContent: {
    [key: string]: {
      slides: number[],
      welcomeText: string
    }
  } = {
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

    if (this.authService.isLoggedIn()) {
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
    return password && confirmPassword && password !== confirmPassword ? 
      { passwordMismatch: true } : null;
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
    } else {
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
    this.currentSlide = this.roleContent[role].slides[0];
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
    
    this.authService.login(credentials)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: AuthResponse) => {
          this.successMessage = 'Login successful! Redirecting to dashboard...';
          setTimeout(() => {
            this.router.navigate([`/${this.selectedRole}/dashboard`]);
          }, 1500);
        },
        error: (error: any) => {
          console.error('Login error:', error);
          this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        }
      });
  }

  onSignup(): void {
    if (this.signupForm.invalid) {
      // Mark fields as touched to show validation errors
      Object.keys(this.signupForm.controls).forEach(field => {
        const control = this.signupForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
      return;
    }
    
    this.clearMessages();
    this.isLoading = true;
    
    // Create the registration data object with proper typing
    const signupData: RegisterRequest = {
      firstName: this.signupForm.value.firstName,
      lastName: this.signupForm.value.lastName,
      email: this.signupForm.value.email,
      password: this.signupForm.value.password,
      role: this.selectedRole
    };
    
    // Only add companyName if it's an employer
    if (this.selectedRole === 'employer' && this.signupForm.value.companyName) {
      signupData.companyName = this.signupForm.value.companyName;
    }

    // Debug log to check what's being sent
    console.log('Sending registration data:', JSON.stringify(signupData));
    
    // Using error handling and auto-login after registration
    this.authService.register(signupData)
      .pipe(
        tap(response => {
          console.log('Registration response:', response);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Registration error details:', error);
          
          // Check if we have a response body with more details
          if (error.error && typeof error.error === 'object') {
            console.error('Server error response:', error.error);
          }
          
          // Check if it's a 500 server error
          if (error.status === 500) {
            this.errorMessage = 'Registration failed due to a server error. Please try again later.';
          } else if (error.status === 400) {
            // Handle validation errors
            this.errorMessage = error.error?.message || 'Invalid registration data. Please check your entries.';
          } else if (error.status === 409) {
            // Handle conflicts (e.g., email already exists)
            this.errorMessage = 'An account with this email already exists.';
          } else {
            this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          }
          
          this.isLoading = false;
          return of(null); // Return observable to continue the chain
        }),
        switchMap(response => {
          if (!response) return of(null); // If error occurred, don't proceed
          
          this.successMessage = 'Registration successful! Logging you in...';
          
          // Auto-login after registration - try direct login instead if registration worked
          return this.performLoginAfterRegistration(signupData.email, signupData.password);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: AuthResponse | null) => {
          if (response) {
            // If login was successful after registration
            setTimeout(() => {
              this.router.navigate([`/${this.selectedRole}/dashboard`]);
            }, 1500);
          }
        },
        error: (error: any) => {
          console.error('Auto-login error:', error);
          // If auto-login fails, we still show registration success but prompt for manual login
          this.successMessage = 'Registration successful! Please login with your credentials.';
          this.authMode = 'login';
          this.loginForm.patchValue({
            email: signupData.email,
            password: ''
          });
        }
      });
  }

  // Separate method for login after registration to help with debugging
  private performLoginAfterRegistration(email: string, password: string) {
    console.log('Attempting auto-login after registration');
    
    const loginData = {
      email: email,
      password: password,
      role: this.selectedRole
    };
    
    return this.authService.login(loginData).pipe(
      tap(response => {
        console.log('Auto-login response:', response);
      }),
      catchError(error => {
        console.error('Auto-login error details:', error);
        throw error; // Rethrow to be caught by the outer subscription
      })
    );
  }

  loginWithGoogle(): void {
    this.clearMessages();
    this.isLoading = true;
    
    this.authService.loginWithGoogle(this.selectedRole)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: AuthResponse) => {
          this.successMessage = 'Google login successful! Redirecting...';
          setTimeout(() => {
            this.router.navigate([`/${this.selectedRole}/dashboard`]);
          }, 1500);
        },
        error: (error: any) => {
          console.error('Google login error:', error);
          this.errorMessage = error.error?.message || 'Google login failed. Please try again.';
        }
      });
  }

  loginWithLinkedIn(): void {
    this.clearMessages();
    this.isLoading = true;
    
    this.authService.loginWithLinkedIn(this.selectedRole)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: AuthResponse) => {
          this.successMessage = 'LinkedIn login successful! Redirecting...';
          setTimeout(() => {
            this.router.navigate([`/${this.selectedRole}/dashboard`]);
          }, 1500);
        },
        error: (error: any) => {
          console.error('LinkedIn login error:', error);
          this.errorMessage = error.error?.message || 'LinkedIn login failed. Please try again.';
        }
      });
  }

  signupWithGoogle(): void {
    this.clearMessages();
    this.isLoading = true;
    
    // For employer role, we need company name
    if (this.selectedRole === 'employer' && !this.signupForm.value.companyName) {
      this.errorMessage = 'Please enter your company name before signing up with Google.';
      this.isLoading = false;
      return;
    }
    
    // For social signup, we're going to pass any additional info needed
    const additionalInfo: { companyName?: string } = this.selectedRole === 'employer' ? 
      { companyName: this.signupForm.value.companyName } : {};
    
    this.authService.signupWithGoogle(this.selectedRole, additionalInfo)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: AuthResponse) => {
          this.successMessage = 'Google signup successful! Redirecting...';
          setTimeout(() => {
            this.router.navigate([`/${this.selectedRole}/dashboard`]);
          }, 1500);
        },
        error: (error: any) => {
          console.error('Google signup error:', error);
          this.errorMessage = error.error?.message || 'Google signup failed. Please try again.';
        }
      });
  }

  signupWithLinkedIn(): void {
    this.clearMessages();
    this.isLoading = true;
    
    // For employer role, we need company name
    if (this.selectedRole === 'employer' && !this.signupForm.value.companyName) {
      this.errorMessage = 'Please enter your company name before signing up with LinkedIn.';
      this.isLoading = false;
      return;
    }
    
    // For social signup, we're going to pass any additional info needed
    const additionalInfo: { companyName?: string } = this.selectedRole === 'employer' ? 
      { companyName: this.signupForm.value.companyName } : {};
    
    this.authService.signupWithLinkedIn(this.selectedRole, additionalInfo)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: AuthResponse) => {
          this.successMessage = 'LinkedIn signup successful! Redirecting...';
          setTimeout(() => {
            this.router.navigate([`/${this.selectedRole}/dashboard`]);
          }, 1500);
        },
        error: (error: any) => {
          console.error('LinkedIn signup error:', error);
          this.errorMessage = error.error?.message || 'LinkedIn signup failed. Please try again.';
        }
      });
  }

  goToForgotPassword(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/forgot-password']);
  }
}
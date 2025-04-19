// src/app/interceptors/http-interceptor.service.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authRoutes = [
    `${environment.apiUrl}/auth/login`,
    `${environment.apiUrl}/auth/register`,
    `${environment.apiUrl}/auth/google`,
    `${environment.apiUrl}/auth/linkedin`,
    `${environment.apiUrl}/auth/forgot-password`,
    `${environment.apiUrl}/auth/reset-password`
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip modification for authentication routes
    if (this.isAuthRoute(request.url)) {
      return next.handle(request);
    }

    return from(this.handleRequest(request)).pipe(
      switchMap(req => next.handle(req)),
      catchError(error => this.handleError(error))
    );
  }

  private async handleRequest(request: HttpRequest<unknown>): Promise<HttpRequest<unknown>> {
    const token = this.authService.getToken();
    
    // Add debug logging in development
    if (!environment.production) {
      console.debug(`[AuthInterceptor] Handling request to ${request.url}`);
      console.debug(`[AuthInterceptor] Token present: ${!!token}`);
    }

    if (!token) return request;

    return request.clone({
      headers: new HttpHeaders({
        ...request.headers,
        Authorization: `Bearer ${token}`
      })
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (!environment.production) {
      console.error('[AuthInterceptor] HTTP Error:', error);
    }

    // Handle specific error codes
    switch (error.status) {
      case 401: // Unauthorized
        this.handleUnauthorized();
        break;
      case 403: // Forbidden
        this.handleForbidden();
        break;
      case 429: // Rate Limited
        this.handleRateLimit();
        break;
    }

    // Return unified error format
    return throwError(() => ({
      status: error.status,
      message: error.error?.message || 'An unexpected error occurred',
      validationErrors: error.error?.errors
    }));
  }

  private handleUnauthorized(): void {
    if (!environment.production) {
      console.warn('[AuthInterceptor] 401 Unauthorized - Clearing authentication');
    }
    
    this.authService.logout();
    
    if (!this.isAuthPage()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
    }
  }

  private handleForbidden(): void {
    if (!environment.production) {
      console.warn('[AuthInterceptor] 403 Forbidden - Redirecting to home');
    }
    
    this.router.navigate(['/'], {
      state: { error: 'You do not have permission to access this resource' }
    });
  }

  private handleRateLimit(): void {
    if (!environment.production) {
      console.warn('[AuthInterceptor] 429 Rate Limited - Showing notification');
    }
    
    // Implement your rate limit notification logic here
  }

  private isAuthRoute(url: string): boolean {
    return this.authRoutes.some(route => url.startsWith(route));
  }

  private isAuthPage(): boolean {
    return this.router.url.startsWith('/login') || 
           this.router.url.startsWith('/register');
  }
}
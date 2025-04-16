// src/app/services/auth.interceptor.ts

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add token to request if available
    if (this.authService.token) {
      request = this.addToken(request, this.authService.token);
    }

    // Continue with the request
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors
        if (error.status === 401 && !this.isRefreshing) {
          return this.handle401Error(request, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      // Try to refresh the token
      return this.authService.refreshToken().pipe(
        switchMap(response => {
          this.isRefreshing = false;
          
          // Retry the request with new token
          return next.handle(this.addToken(request, response.data.token));
        }),
        catchError(error => {
          this.isRefreshing = false;
          
          // If refresh fails, logout user and redirect to login
          this.authService.logout();
          return throwError(() => error);
        })
      );
    }
    
    return next.handle(request);
  }
}
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get the auth token
  const token = authService.getToken();
  
  // Add debug statement
  console.log(`Request to ${req.url} - Token exists: ${!!token}`);
  
  // Clone the request and add the token if it exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Handle the request and catch any errors
  return next(req).pipe(
    catchError(error => {
      // Handle 401 Unauthorized errors (expired token, etc.)
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth']);
      }
      return throwError(() => error);
    })
  );
};
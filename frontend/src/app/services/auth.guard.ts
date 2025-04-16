// src/app/services/auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Check if user is logged in
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/auth-screen']);
      return false;
    }

    // Check if route requires a specific role
    const requiredRole = route.data['role'] as string;
    if (requiredRole && !this.authService.hasRole(requiredRole as 'jobseeker' | 'employer' | 'admin')) {
      // Redirect to appropriate dashboard based on actual role
      this.authService.navigateToDashboard();
      return false;
    }

    return true;
  }
}
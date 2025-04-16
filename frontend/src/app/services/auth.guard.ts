// src/app/services/auth.guard.ts
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return false;
    }

    // Check if role restriction exists and if user has the required role
    const requiredRole = route.data['role'] as string;
    if (requiredRole && this.authService.getUserRole() !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      const userRole = this.authService.getUserRole();
      if (userRole) {
        this.router.navigate([`/${userRole}/dashboard`]);
      } else {
        this.router.navigate(['/auth']);
      }
      return false;
    }

    return true;
  }
}
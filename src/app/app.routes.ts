import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthScreenComponent } from './pages/auth-screen/auth-screen.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route points to home
  { path: 'home', component: HomeComponent },
  {path:'login',component:AuthScreenComponent},
  {path:'register',component:AuthScreenComponent},
  {path:'forgot-password',component:ForgotPasswordComponent},


  // Add other routes as needed
  { path: '**', redirectTo: '' } // Redirect unknown paths to home
];
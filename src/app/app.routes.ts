import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthScreenComponent } from './pages/auth-screen/auth-screen.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { DashboardComponent } from './pages/jobseeker/dashboard/dashboard.component';
import { PortfolioComponent } from './pages/jobseeker/portfolio/portfolio.component';
import { JobsExplorerComponent } from './pages/jobseeker/jobs-explorer/jobs-explorer.component';
import { AiCareerPathComponent } from './pages/jobseeker/ai-career-path/ai-career-path.component';
import { CvManagerComponent } from './pages/jobseeker/cv-manager/cv-manager.component';
import { SettingsComponent } from './pages/jobseeker/settings/settings.component';
import { JobseekerProfileComponent } from './pages/jobseeker/jobseeker-profile/jobseeker-profile.component';
import { EmployerDashboardComponent } from './pages/employer/employer-dashboard/employer-dashboard.component';
import { ProfileComponent } from './pages/employer/profile/profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route points to home
  { path: 'home', component: HomeComponent },
  {path:'login',component:AuthScreenComponent},
  {path:'register',component:AuthScreenComponent},
  {path:'forgot-password',component:ForgotPasswordComponent},
  { path: '', redirectTo: 'jobseeker/dashboard', pathMatch: 'full' },
  { path: 'jobseeker/dashboard', component: DashboardComponent },
  { path: 'jobseeker/portfolio', component: PortfolioComponent},
  {path:'jobseeker/jobs',component:JobsExplorerComponent},
  {path:'jobseeker/ai-career',component:AiCareerPathComponent},
  {path:'jobseeker/cv',component:CvManagerComponent},
  {path:'jobseeker/settings',component:SettingsComponent},
  {path:'jobseeker/profile',component:JobseekerProfileComponent},

  //employer routes
  {path:'employer/dashboard',component:EmployerDashboardComponent},
  {path:'employer/profile',component:ProfileComponent}







  // Add other routes as needed
  // { path: '**', redirectTo: '' } // Redirect unknown paths to home
];
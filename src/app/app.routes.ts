import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthScreenComponent } from './pages/auth-screen/auth-screen.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { DashboardComponent } from './pages/jobseeker/dashboard/dashboard.component';
import { PortfolioComponent } from './pages/jobseeker/portfolio/portfolio.component';
import { JobsExplorerComponent } from './pages/jobseeker/jobs-explorer/jobs-explorer.component';
import { AiCareerPathComponent } from './pages/jobseeker/ai-career-path/ai-career-path.component';
import { CvManagerComponent } from './pages/jobseeker/cv-manager/cv-manager.component';
import { JobseekerProfileComponent } from './pages/jobseeker/jobseeker-profile/jobseeker-profile.component';
import { EmployerDashboardComponent } from './pages/employer/employer-dashboard/employer-dashboard.component';
import { ProfileComponent } from './pages/employer/profile/profile.component';
import { JobPostsComponent } from './pages/employer/job-posts/job-posts.component';
import { CandidateMatchesComponent } from './pages/employer/candidate-matches/candidate-matches.component';
import { ChatInterfaceComponent } from './pages/employer/chat-interface/chat-interface.component';
import { InterviewsComponent } from './pages/employer/interviews/interviews.component';
import { SettingsComponent } from './pages/jobseeker/settings/settings.component';
import { EmployerSettingsComponent } from './pages/employer/settings/employer-settings.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './pages/admin/user-management/user-management.component';

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
  {path:'employer/profile',component:ProfileComponent},
  {path:'employer/job-posts',component:JobPostsComponent},
  {path:'employer/candidate-matches',component:CandidateMatchesComponent},
  {path:'employer/chat-interface',component:ChatInterfaceComponent},
  {path:'employer/interviews',component:InterviewsComponent},
  {path:'employer/settings',component:EmployerSettingsComponent},

//admin routes
{path:'admin/dashboard',component:AdminDashboardComponent},
{path:'admin/user-management',component:UserManagementComponent}
















  // Add other routes as needed
  // { path: '**', redirectTo: '' } // Redirect unknown paths to home
];
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthScreenComponent } from './pages/auth-screen/auth-screen.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route points to home
  { path: 'home', component: HomeComponent },
  {path:'login',component:AuthScreenComponent},
  {path:'register',component:AuthScreenComponent},


  // Add other routes as needed
  { path: '**', redirectTo: '' } // Redirect unknown paths to home
];
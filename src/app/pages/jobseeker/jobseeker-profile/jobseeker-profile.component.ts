// jobseeker-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-jobseeker-profile',
  standalone: true,
  imports: [CommonModule, FormsModule,SidebarComponent],
  templateUrl: './jobseeker-profile.component.html',
  styleUrls: ['./jobseeker-profile.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('400ms 100ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class JobseekerProfileComponent implements OnInit {
  profileCompletion = 85;
  sidebarCollapsed = false;
  
  user = {
    name: 'Elena Rodriguez',
    title: 'UX/UI Designer',
    location: 'New York, USA',
    email: 'elena@example.com',
    about: 'Experienced Software Engineer with 8+ years of expertise in full-stack development. Passionate about creating scalable solutions and mentoring junior developers. Strong focus on clean code and best practices.',
    skills: ['JavaScript', 'React.js', 'Node.js', 'Python', 'AWS', 'Docker'],
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Solutions Inc.',
        period: '2021 - Present'
      },
      {
        title: 'Software Engineer',
        company: 'Digital Innovations Ltd.',
        period: '2016 - 2021'
      }
    ],
    recommendations: [
      { role: 'Tech Lead', selected: true },
      { role: 'Solution Architect', selected: true },
      { role: 'Senior Developer', selected: false }
    ]
  };

  ngOnInit(): void {
    this.sidebarCollapsed = window.innerWidth < 768;
    // Simulate loading delay for animation purposes
    setTimeout(() => {
      this.loadProfileData();
    }, 300);
  }

  loadProfileData(): void {
    // This would fetch actual data from a service in a real app
    console.log('Profile data loaded');
  }

  onToggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
  

  addSkill(): void {
    // Implementation for adding a skill
  }

  addExperience(): void {
    // Implementation for adding experience
  }

  uploadCV(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('CV uploaded:', file.name);
      // Handle CV upload logic
    }
  }
}
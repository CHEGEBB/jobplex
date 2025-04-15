import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faBuilding, faUsers, faMapMarkerAlt, faGlobe, faPhone, 
  faEnvelope, faBriefcase, faHandshake, faEdit, faSave, 
  faTrash, faImage, faVideo, faLeaf, faHeart, faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import { SidebarEmployerComponent } from '../../../components/sidebar-employer/sidebar-employer.component';

// Import the employer sidebar

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FontAwesomeModule,
    SidebarEmployerComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  // Font Awesome icons
  faBuilding = faBuilding;
  faUsers = faUsers;
  faMapMarkerAlt = faMapMarkerAlt;
  faGlobe = faGlobe;
  faPhone = faPhone;
  faEnvelope = faEnvelope;
  faBriefcase = faBriefcase;
  faHandshake = faHandshake;
  faEdit = faEdit;
  faSave = faSave;
  faTrash = faTrash;
  faImage = faImage;
  faVideo = faVideo;
  faLeaf = faLeaf;
  faHeart = faHeart;
  faLightbulb = faLightbulb;

  companyForm!: FormGroup;
  isEditing = false;
  showEditModal = false;
  activeTab = 'overview';
  benefitsData: any[] = [];

  // Mock company data (would come from an API in production)
  companyData = {
    name: 'TechInnovate Solutions',
    logo: 'assets/logocompany.png',
    coverImage: 'assets/cover.jpg',
    description: 'TechInnovate Solutions is a leading technology company specializing in AI-driven solutions for enterprise clients. We create innovative software that transforms how businesses operate.',
    industry: 'Technology',
    founded: '2015',
    size: '50-200 employees',
    headquarters: 'San Francisco, CA',
    website: 'www.techinnovate.example.com',
    phone: '+1 (555) 123-4567',
    email: 'careers@techinnovate.example.com',
    mission: 'Our mission is to democratize artificial intelligence and make it accessible to businesses of all sizes.',
    vision: 'We envision a world where technology enhances human potential and creates sustainable solutions for global challenges.',
    culture: {
      values: [
        { title: 'Innovation', description: 'We foster creativity and embrace cutting-edge technologies' },
        { title: 'Collaboration', description: 'We believe great ideas come from diverse teams working together' },
        { title: 'Excellence', description: 'We pursue the highest standards in everything we do' }
      ],
      workEnvironment: 'Modern open-plan offices with flexible work policies and remote options available'
    },
    benefits: [
      { icon: 'heart', title: 'Health & Wellness', description: 'Comprehensive medical, dental, and vision coverage' },
      { icon: 'briefcase', title: 'Flexible Work', description: 'Remote work options and flexible hours' },
      { icon: 'lightbulb', title: 'Learning Budget', description: '$2000 annual learning and development budget' },
      { icon: 'leaf', title: 'Paid Time Off', description: 'Generous vacation policy with 20+ days PTO' }
    ],
    socialResponsibility: [
      { title: 'Green Initiatives', description: 'Carbon-neutral operations since 2020' },
      { title: 'Community Outreach', description: 'Regular tech workshops for underserved communities' }
    ]
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.benefitsData = this.companyData.benefits;
  }

  initializeForm(): void {
    this.companyForm = this.fb.group({
      name: [this.companyData.name, Validators.required],
      industry: [this.companyData.industry, Validators.required],
      description: [this.companyData.description, Validators.required],
      founded: [this.companyData.founded, Validators.required],
      size: [this.companyData.size, Validators.required],
      headquarters: [this.companyData.headquarters, Validators.required],
      website: [this.companyData.website, Validators.required],
      phone: [this.companyData.phone, Validators.required],
      email: [this.companyData.email, [Validators.required, Validators.email]],
      mission: [this.companyData.mission, Validators.required],
      vision: [this.companyData.vision, Validators.required],
      workEnvironment: [this.companyData.culture.workEnvironment, Validators.required]
    });
  }

  toggleEditMode(): void {
    this.showEditModal = true;
  }

  closeModal(): void {
    this.showEditModal = false;
  }

  saveCompanyProfile(): void {
    if (this.companyForm.valid) {
      // In a real app, this would be an API call
      console.log('Form data to save:', this.companyForm.value);
      
      // Update the local data (simulating successful API call)
      this.companyData = {
        ...this.companyData,
        ...this.companyForm.value
      };
      
      this.showEditModal = false;
      
      // Show success message (would use a proper notification service)
      alert('Company profile updated successfully!');
    } else {
      this.companyForm.markAllAsTouched();
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  uploadLogo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.companyData.logo = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  uploadCoverImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.companyData.coverImage = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }
}
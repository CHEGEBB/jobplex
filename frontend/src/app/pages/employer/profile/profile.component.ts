import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faBuilding, faUsers, faMapMarkerAlt, faGlobe, faPhone, 
  faEnvelope, faBriefcase, faHandshake, faEdit, faSave, 
  faTrash, faImage, faVideo, faLeaf, faHeart, faLightbulb,
  faPlus, faCamera, faCheck, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { SidebarEmployerComponent } from '../../../components/sidebar-employer/sidebar-employer.component';
import { EmployerProfileService } from '../../../services/employer-profile.service';
import { finalize, tap } from 'rxjs/operators';

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
  faPlus = faPlus;
  faCamera = faCamera;
  faCheck = faCheck;
  faExclamationCircle = faExclamationCircle;

  companyForm!: FormGroup;
  isEditing = false;
  showEditModal = false;
  activeTab = 'overview';
  benefitsData: any[] = [];
  loading = true;
  hasProfile = false;
  showCreateProfileModal = false;
  savingProfile = false;
  errorMessage = '';
  successMessage = '';
  
  // Available cover images for selection
  availableCoverImages = [
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1470',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?q=80&w=1470',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1470',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1470',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1470',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1470',
    'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=1470',
    'https://plus.unsplash.com/premium_photo-1709932754899-5c36599fface?q=80&w=1509'
  ];
  
  // Selected cover image 
  selectedCoverImage = this.availableCoverImages[0];

  // Company logo generation options
  logoOptions = [
    { name: 'Letter', value: 'letter' },
    { name: 'Icon', value: 'icon' }
  ];
  selectedLogoOption = 'letter';
  logoLetter = '';
  logoColor = '#4F46E5'; // Indigo default
  logoColors = [
    '#4F46E5', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#6366F1'  // Indigo
  ];

  // Empty company data template
  companyData: any = {
    name: '',
    logo: '',
    coverImage: '',
    description: '',
    industry: '',
    founded: '',
    size: '',
    headquarters: '',
    website: '',
    phone: '',
    email: '',
    mission: '',
    vision: '',
    culture: {
      values: [
        { title: '', description: '' },
        { title: '', description: '' },
        { title: '', description: '' }
      ],
      workEnvironment: ''
    },
    benefits: [
      { icon: 'heart', title: 'Health & Wellness', description: '' },
      { icon: 'briefcase', title: 'Flexible Work', description: '' },
      { icon: 'lightbulb', title: 'Learning Budget', description: '' },
      { icon: 'leaf', title: 'Paid Time Off', description: '' }
    ],
    socialResponsibility: [
      { title: 'Green Initiatives', description: '' },
      { title: 'Community Outreach', description: '' }
    ]
  };

  constructor(
    private fb: FormBuilder,
    private employerProfileService: EmployerProfileService
  ) {}

  ngOnInit(): void {
    this.loadEmployerProfile();
  }

  loadEmployerProfile(): void {
    this.loading = true;
    this.employerProfileService.getProfile()
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (profile) => {
          if (profile) {
            this.companyData = profile;
            this.hasProfile = true;
            this.benefitsData = this.companyData.benefits;
            this.initializeForm();
          } else {
            this.hasProfile = false;
          }
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.hasProfile = false;
        }
      });
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

  initializeCreateForm(): void {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      industry: ['', Validators.required],
      description: ['', Validators.required],
      founded: ['', Validators.required],
      size: ['', Validators.required],
      headquarters: ['', Validators.required],
      website: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mission: ['', Validators.required],
      vision: ['', Validators.required],
      workEnvironment: ['', Validators.required]
    });
  }

  toggleEditMode(): void {
    this.showEditModal = true;
  }

  closeModal(): void {
    this.showEditModal = false;
  }

  showCreateProfile(): void {
    this.initializeCreateForm();
    this.showCreateProfileModal = true;
    // Generate initial logo letter based on company name
    this.logoLetter = 'C';
  }

  closeCreateModal(): void {
    this.showCreateProfileModal = false;
    this.errorMessage = '';
  }

  saveCompanyProfile(): void {
    if (this.companyForm.valid) {
      // Prepare the data to save with current form values
      const updatedCompany = {
        ...this.companyData,
        ...this.companyForm.value,
        culture: {
          ...this.companyData.culture,
          workEnvironment: this.companyForm.value.workEnvironment
        }
      };
      
      this.savingProfile = true;
      this.employerProfileService.updateProfile(updatedCompany)
        .pipe(
          finalize(() => this.savingProfile = false)
        )
        .subscribe({
          next: (response) => {
            this.companyData = response;
            this.showEditModal = false;
            this.successMessage = 'Company profile updated successfully!';
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            this.errorMessage = 'Failed to update profile. Please try again.';
            setTimeout(() => this.errorMessage = '', 3000);
          }
        });
    } else {
      this.companyForm.markAllAsTouched();
    }
  }

  createCompanyProfile(): void {
    if (this.companyForm.valid) {
      // Generate the logo based on selection
      let logoUrl = '';
      if (this.selectedLogoOption === 'letter') {
        logoUrl = this.generateLetterLogo();
      } else {
        logoUrl = 'assets/company-icon.png'; // Default icon
      }

      // Prepare the new company profile data
      const newCompany = {
        ...this.companyForm.value,
        logo: logoUrl,
        coverImage: this.selectedCoverImage,
        culture: {
          values: [
            { title: 'Innovation', description: 'We foster creativity and embrace cutting-edge technologies' },
            { title: 'Collaboration', description: 'We believe great ideas come from diverse teams working together' },
            { title: 'Excellence', description: 'We pursue the highest standards in everything we do' }
          ],
          workEnvironment: this.companyForm.value.workEnvironment
        },
        benefits: [
          { icon: 'heart', title: 'Health & Wellness', description: 'Comprehensive medical, dental, and vision coverage' },
          { icon: 'briefcase', title: 'Flexible Work', description: 'Remote work options and flexible hours' },
          { icon: 'lightbulb', title: 'Learning Budget', description: 'Annual learning and development budget' },
          { icon: 'leaf', title: 'Paid Time Off', description: 'Generous vacation policy' }
        ],
        socialResponsibility: [
          { title: 'Green Initiatives', description: 'Environmentally conscious operations' },
          { title: 'Community Outreach', description: 'Regular workshops and programs for the community' }
        ]
      };
      
      this.savingProfile = true;
      this.employerProfileService.createProfile(newCompany)
        .pipe(
          finalize(() => this.savingProfile = false)
        )
        .subscribe({
          next: (response) => {
            this.companyData = response;
            this.benefitsData = this.companyData.benefits;
            this.hasProfile = true;
            this.showCreateProfileModal = false;
            this.successMessage = 'Company profile created successfully!';
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            console.error('Error creating profile:', error);
            this.errorMessage = 'Failed to create profile. Please try again.';
            setTimeout(() => this.errorMessage = '', 3000);
          }
        });
    } else {
      this.companyForm.markAllAsTouched();
    }
  }

  generateLetterLogo(): string {
    // In a real implementation, you might use canvas to generate a real image
    // Here we're just returning a "fake" data URL that would represent the letter logo
    // In production, you would want to actually generate an image or store this information to recreate it
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${this.logoColor.replace('#', '%23')}"/><text x="50" y="70" font-family="Arial" font-size="60" text-anchor="middle" fill="white">${this.logoLetter}</text></svg>`;
  }

  updateLogoLetter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.logoLetter = input.value.charAt(0).toUpperCase();
  }

  selectCoverImage(imageUrl: string): void {
    this.selectedCoverImage = imageUrl;
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
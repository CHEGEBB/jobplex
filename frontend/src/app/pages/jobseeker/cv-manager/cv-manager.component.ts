import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';


interface CV {
  id: string;
  name: string;
  file: File;
  dateUploaded: Date;
  tags: string[];
  isPrimary: boolean;
  previewUrl?: string;
}

@Component({
  selector: 'app-cv-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './cv-manager.component.html',
  styleUrls: ['./cv-manager.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class CvManagerComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  // UI state
  sidebarCollapsed = false;
  isGridView = true;
  isDragging = false;
  showUploadArea = true;
  isAddingTag = false;
  newTag = '';
  availableTags = ['Remote', 'Tech', 'Finance', 'Marketing', 'Design', 'Entry Level', 'Senior', 'Contract'];
  
  // CV Data
  cvList: CV[] = [];
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    // Initialize with sample data for testing
    this.loadMockData();
  }
  
  onToggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
    // You might want to handle additional layout adjustments here
  }
  
  toggleView(): void {
    this.isGridView = !this.isGridView;
  }
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }
  
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }
  
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileUpload(files);
    }
  }
  
  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    
    if (files && files.length > 0) {
      this.handleFileUpload(files);
    }
  }
  
  handleFileUpload(files: FileList): void {
    Array.from(files).forEach((file) => {
      // Only accept PDF files
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = () => {
          const newCV: CV = {
            id: this.generateId(),
            name: file.name,
            file: file,
            dateUploaded: new Date(),
            tags: [],
            isPrimary: this.cvList.length === 0, // First CV is primary by default
            previewUrl: reader.result as string
          };
          
          this.cvList.unshift(newCV);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload PDF files only.');
      }
    });
    
    // Reset file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
  
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
  
  removeCV(id: string): void {
    const index = this.cvList.findIndex(cv => cv.id === id);
    if (index !== -1) {
      const wasRemovingPrimary = this.cvList[index].isPrimary;
      this.cvList.splice(index, 1);
      
      // If we removed the primary CV, make the first one primary (if any exist)
      if (wasRemovingPrimary && this.cvList.length > 0) {
        this.cvList[0].isPrimary = true;
      }
    }
  }
  
  setPrimaryCV(id: string): void {
    this.cvList.forEach(cv => {
      cv.isPrimary = cv.id === id;
    });
  }
  
  downloadCV(id: string): void {
    const cv = this.cvList.find(cv => cv.id === id);
    if (cv) {
      const link = document.createElement('a');
      link.href = cv.previewUrl || '';
      link.download = cv.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  
  startAddTag(cv: CV): void {
    this.isAddingTag = true;
    this.newTag = '';
  }
  
  addTag(cv: CV, tag: string): void {
    if (tag && !cv.tags.includes(tag)) {
      cv.tags.push(tag);
    }
    this.isAddingTag = false;
  }
  
  removeTag(cv: CV, tag: string): void {
    const index = cv.tags.indexOf(tag);
    if (index !== -1) {
      cv.tags.splice(index, 1);
    }
  }
  
  // Utilities
  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
  
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  // Mock data for testing
  private loadMockData(): void {
    const mockCV1: CV = {
      id: this.generateId(),
      name: 'John_Doe_Resume_2025.pdf',
      file: new File([], 'John_Doe_Resume_2025.pdf', { type: 'application/pdf' }),
      dateUploaded: new Date(),
      tags: ['Tech', 'Remote'],
      isPrimary: true,
      previewUrl: 'assets/cv.jpg'
    };
    
    const mockCV2: CV = {
      id: this.generateId(),
      name: 'Software_Developer_CV.pdf',
      file: new File([], 'Software_Developer_CV.pdf', { type: 'application/pdf' }),
      dateUploaded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      tags: ['Tech', 'Senior'],
      isPrimary: false,
      previewUrl: 'assets/cv2.jpg'
    };
    const mockCV3: CV = {
      id: this.generateId(),
      name: 'Marketing_Expert_CV.pdf',
      file: new File([], 'Marketing_Expert_CV.pdf', { type: 'application/pdf' }),
      dateUploaded: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      tags: ['Marketing'],
      isPrimary: false,
      previewUrl: 'assets/cv3.jpg'
    };
    
    this.cvList.push(mockCV1, mockCV2, mockCV3);
  }
}
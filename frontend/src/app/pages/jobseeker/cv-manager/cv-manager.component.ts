import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { CvService } from '../../../services/cv.service';
import { finalize } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';

interface CV {
  id: number;
  file_name: string;
  file_url: string;
  is_primary: boolean;
  tags: string[];
  uploaded_at: string;
  // UI-specific properties
  isAddingTag?: boolean;
  newTag?: string;
  previewUrl?: string;
}

@Component({
  selector: 'app-cv-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent, HttpClientModule],
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
  isLoading = false;
  hasError = false;
  errorMessage = '';
  
  constructor(private cvService: CvService) {}
  
  ngOnInit(): void {
    this.loadCVs();
  }
  
  loadCVs(): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.cvService.getCVs()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (cvs) => {
          this.cvList = cvs.map(cv => ({
            ...cv,
            isAddingTag: false,
            newTag: '',
            // Use file_url as preview URL
            previewUrl: cv.file_url
          }));
        },
        error: (err) => {
          console.error('Error loading CVs:', err);
          this.hasError = true;
          this.errorMessage = 'Failed to load your CVs. Please try again later.';
        }
      });
  }
  
  onToggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
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
    // Only accept PDF files
    const file = Array.from(files).find(file => file.type === 'application/pdf');
    
    if (!file) {
      alert('Please upload PDF files only.');
      return;
    }
    
    this.isLoading = true;
    this.cvService.uploadCV(file)
      .pipe(finalize(() => {
        this.isLoading = false;
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
      }))
      .subscribe({
        next: (response: any) => {
          // Refresh the CV list
          this.loadCVs();
        },
        error: (err) => {
          console.error('Error uploading CV:', err);
          alert('Failed to upload CV. Please try again later.');
        }
      });
  }
  
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
  
  removeCV(id: number): void {
    if (confirm('Are you sure you want to delete this CV?')) {
      this.isLoading = true;
      this.cvService.deleteCV(id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            // Remove from the list
            this.cvList = this.cvList.filter(cv => cv.id !== id);
          },
          error: (err) => {
            console.error('Error deleting CV:', err);
            alert('Failed to delete CV. Please try again later.');
          }
        });
    }
  }
  
  setPrimaryCV(id: number): void {
    this.isLoading = true;
    this.cvService.setPrimaryCV(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (updatedCV: any) => {
          // Update primary status across all CVs
          this.cvList.forEach(cv => {
            cv.is_primary = cv.id === id;
          });
        },
        error: (err) => {
          console.error('Error setting primary CV:', err);
          alert('Failed to set primary CV. Please try again later.');
        }
      });
  }
  
  downloadCV(id: number): void {
    const cv = this.cvList.find(cv => cv.id === id);
    if (cv) {
      this.cvService.downloadCV(cv.file_url);
    }
  }
  
  startAddTag(cv: CV): void {
    // Reset any other CV that might be in tag adding mode
    this.cvList.forEach(c => c.isAddingTag = false);
    cv.isAddingTag = true;
    cv.newTag = '';
  }
  
 // Only updating the tag-related methods in the component
// These should replace the existing methods in your component

addTag(cv: CV, tag: string): void {
  if (!tag) {
    cv.isAddingTag = false;
    return;
  }
  
  if (!cv.tags) {
    cv.tags = [];
  }
  
  if (tag && !cv.tags.includes(tag)) {
    this.isLoading = true;
    
    this.cvService['addTag'](cv.id, tag)
      .pipe(finalize(() => {
      this.isLoading = false;
      cv.isAddingTag = false;
      }))
      .subscribe({
      next: (updatedCV: CV) => {
        // Update the CV with server response
        const index: number = this.cvList.findIndex((c: CV) => c.id === cv.id);
        if (index !== -1) {
        this.cvList[index].tags = updatedCV.tags;
        }
      },
      error: (err: any) => {
        console.error('Error adding tag:', err);
        alert('Failed to add tag. Please try again later.');
      }
      });
  } else {
    cv.isAddingTag = false;
  }
}

removeTag(cv: CV, tag: string): void {
  const index = cv.tags?.indexOf(tag);
  if (index !== undefined && index !== -1) {
    this.isLoading = true;
    
    this.cvService['removeTag'](cv.id, tag)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
      next: (updatedCV: CV) => {
        // Update the CV with server response
        const index: number = this.cvList.findIndex((c: CV) => c.id === cv.id);
        if (index !== -1) {
        this.cvList[index].tags = updatedCV.tags;
        }
      },
      error: (err: any) => {
        console.error('Error removing tag:', err);
        alert('Failed to remove tag. Please try again later.');
      }
      });
  }
}
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  getFileName(path: string): string {
    // Extract just the file name from the full path/URL
    const parts = path.split('/');
    return parts[parts.length - 1];
  }
}
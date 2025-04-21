import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { CvService, CV } from '../../../services/cv.service';
import { finalize } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';

// Extended CV interface for UI features
interface CvWithUI extends CV {
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
  cvList: CvWithUI[] = [];
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
            // Set file_url if needed
            file_url: cv.file_url || `http://18.208.134.30/api/cvs/${cv.id}/view`
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
        next: (response) => {
          // Add the new CV to the list with UI properties
          const newCV: CvWithUI = {
            ...response,
            isAddingTag: false,
            newTag: '',
            file_url: `http://18.208.134.30/api/cvs/${response.id}/view`
          };
          this.cvList.unshift(newCV);
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
        next: (updatedCV) => {
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
    this.isLoading = true;
    this.cvService.downloadCV(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (blob) => {
          // Find the CV to get its filename
          const cv = this.cvList.find(c => c.id === id);
          if (cv) {
            // Create blob URL and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = cv.file_name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }
        },
        error: (err) => {
          console.error('Error downloading CV:', err);
          alert('Failed to download CV. Please try again later.');
        }
      });
  }
  
  viewCV(id: number): void {
    this.isLoading = true;
    this.cvService.viewCV(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (blob) => {
          // Create a blob URL and open in new tab
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        },
        error: (err) => {
          console.error('Error viewing CV:', err);
          alert('Failed to view CV. Please try again later.');
        }
      });
  }
  
  startAddTag(cv: CvWithUI): void {
    // Reset any other CV that might be in tag adding mode
    this.cvList.forEach(c => c.isAddingTag = false);
    cv.isAddingTag = true;
    cv.newTag = '';
  }
  
  addTag(cv: CvWithUI, tag: string): void {
    if (!tag) {
      cv.isAddingTag = false;
      return;
    }
    
    if (!cv.tags) {
      cv.tags = [];
    }
    
    if (tag && !cv.tags.includes(tag)) {
      this.isLoading = true;
      
      this.cvService.addTag(cv.id, tag)
        .pipe(finalize(() => {
          this.isLoading = false;
          cv.isAddingTag = false;
        }))
        .subscribe({
          next: (updatedCV) => {
            // Update the CV with server response
            const index = this.cvList.findIndex(c => c.id === cv.id);
            if (index !== -1) {
              this.cvList[index].tags = updatedCV.tags;
            }
          },
          error: (err) => {
            console.error('Error adding tag:', err);
            alert('Failed to add tag. Please try again later.');
          }
        });
    } else {
      cv.isAddingTag = false;
    }
  }
  
  removeTag(cv: CvWithUI, tag: string): void {
    const index = cv.tags?.indexOf(tag);
    if (index !== undefined && index !== -1) {
      this.isLoading = true;
      
      this.cvService.removeTag(cv.id, tag)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (updatedCV) => {
            // Update the CV with server response
            const index = this.cvList.findIndex(c => c.id === cv.id);
            if (index !== -1) {
              this.cvList[index].tags = updatedCV.tags;
            }
          },
          error: (err) => {
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
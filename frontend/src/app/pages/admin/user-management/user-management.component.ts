import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService, User } from '../../../services/users.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { SidebarAdminComponent } from '../../../components/sidebar-admin/sidebar-admin.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarAdminComponent],
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit {
  // User list properties
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUsers: User[] = [];
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalUsers: number = 0;
  totalPages: number = 0;
  
  // Sorting
  sortField: string = 'createdAt';
  sortOrder: string = 'desc';
  
  // Filtering
  searchTerm: string = '';
  filterRole: string = 'all';
  filterStatus: string = 'all';
  filterVerified: string = 'all';
  
  // UI state
  showBulkPanel: boolean = false;
  activeActionMenu: string | null = null;
  showModal: boolean = false;
  showDetailsModal: boolean = false;
  showConfirmModal: boolean = false;
  isEditMode: boolean = false;
  showPassword: boolean = false;
  
  // User forms
  userForm: FormGroup;
  noteForm: FormGroup;
  
  // Selected user for details/edit
  selectedUser: User | null = null;
  
  // Modal configurations
  confirmModalTitle: string = '';
  confirmModalMessage: string = '';
  confirmModalType: 'delete' | 'suspend' | 'activate' | 'other' = 'other';
  confirmButtonText: string = 'Confirm';
  confirmAction: Function = () => {};
  
  // Toast notifications
  showToast: boolean = false;
  toastTitle: string = '';
  toastMessage: string = '';
  toastType: 'success' | 'warning' | 'error' | 'info' = 'info';
  toastProgress: number = 100;
  toastTimeout: any;
  
  // Tabs in user details
  currentTab: 'activity' | 'security' | 'notes' = 'activity';
  
  // Mock data (replace with real API calls)
  userActivityLog: any[] = [];
  userSessions: any[] = [];
  adminNotes: any[] = [];
  
  // Stats
  activeUsers: number = 0;
  pendingUsers: number = 0;
  suspendedUsers: number = 0;
  
  // Math reference for template
  Math: any = Math;

  constructor(
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    private authService: AuthService
  ) {
    this.userForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['jobseeker', Validators.required],
      status: ['active', Validators.required],
      isVerified: [false]
    });
    
    this.noteForm = this.formBuilder.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  // Load users with current pagination and filters
  loadUsers(): void {
    this.usersService.getAllUsers(
      this.currentPage,
      this.pageSize,
      this.filterRole !== 'all' ? this.filterRole : undefined,
      this.searchTerm !== '' ? this.searchTerm : undefined
    ).subscribe({
      next: (response) => {
        this.users = response.users;
        this.filteredUsers = this.users;
        this.totalUsers = response.pagination.totalUsers;
        this.totalPages = response.pagination.totalPages;
        
        // Calculate stats
        this.calculateStats();
        
        // Apply additional client-side filters
        this.applyClientSideFilters();
      },
      error: (error) => {
        this.showToastNotification('Error', `Failed to load users: ${error.message}`, 'error');
      }
    });
  }
  
  // Calculate user statistics
  calculateStats(): void {
    this.activeUsers = this.users.filter(user => user.status === 'active').length;
    this.pendingUsers = this.users.filter(user => user.status === 'pending').length;
    this.suspendedUsers = this.users.filter(user => user.status === 'suspended').length;
  }
  
  // Apply client-side filters
  applyClientSideFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      // Status filter
      if (this.filterStatus !== 'all' && user.status !== this.filterStatus) {
        return false;
      }
      
      // Verification filter
      if (this.filterVerified === 'verified' && !user.isVerified) {
        return false;
      }
      
      if (this.filterVerified === 'unverified' && user.isVerified) {
        return false;
      }
      
      return true;
    });
    
    // Apply sorting
    this.sortUsers();
  }
  
  // Filter users based on search and filters
  filterUsers(): void {
    // Reset to first page when filters change
    this.currentPage = 1;
    
    // If filter is by role or search term, reload from server
    if (this.filterRole !== 'all' || this.searchTerm.trim() !== '') {
      this.loadUsers();
    } else {
      // Otherwise just apply client-side filters
      this.applyClientSideFilters();
    }
  }
  
  // Reset all filters
  resetFilters(): void {
    this.searchTerm = '';
    this.filterRole = 'all';
    this.filterStatus = 'all';
    this.filterVerified = 'all';
    this.currentPage = 1;
    this.loadUsers();
  }
  
  // Sort users
  sortBy(field: string): void {
    if (this.sortField === field) {
      // Toggle sort order
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    
    this.sortUsers();
  }
  
  // Apply sorting to filtered users
  sortUsers(): void {
    this.filteredUsers.sort((a, b) => {
      let valA: any = a[this.sortField as keyof User];
      let valB: any = b[this.sortField as keyof User];
      
      if (this.sortField === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      
      if (valA < valB) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  
  // Pagination methods// Fix for the pagination issue
goToPage(page: number | string): void {
  // Skip if the page is the ellipsis or invalid
  if (page === '...' || typeof page !== 'number') {
    return;
  }
  
  if (page < 1 || page > this.getTotalPages()) {
    return;
  }
  
  this.currentPage = page;
  this.loadUsers();
}

// Fix for the selectedUser issue
resetPassword(user: User | null): void {
  if (!user) {
    return; // Early return if user is null
  }
  
  // In a real application, you would trigger a password reset email
  this.showToastNotification('Success', 'Password reset link has been sent to the user', 'success');
  this.activeActionMenu = null;
}
  getTotalPages(): number {
    return Math.ceil(this.totalUsers / this.pageSize);
  }
  
  getPaginationArray(): (number | string)[] {
    const totalPages = this.getTotalPages();
    const current = this.currentPage;
    
    if (totalPages <= 7) {
      // If few pages, show all
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Complex pagination with ellipsis
    if (current <= 3) {
      return [1, 2, 3, 4, '...', totalPages - 1, totalPages];
    } else if (current >= totalPages - 2) {
      return [1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      return [1, '...', current - 1, current, current + 1, '...', totalPages];
    }
  }
  
  // User selection and bulk actions
  toggleUserSelection(user: User): void {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    
    if (index === -1) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(index, 1);
    }
  }
  
  toggleAllUsers(): void {
    if (this.areAllUsersSelected()) {
      this.selectedUsers = [];
    } else {
      this.selectedUsers = [...this.filteredUsers];
    }
  }
  
  isUserSelected(userId: string): boolean {
    return this.selectedUsers.some(user => user.id === userId);
  }
  
  areAllUsersSelected(): boolean {
    return this.filteredUsers.length > 0 && this.selectedUsers.length === this.filteredUsers.length;
  }
  
  toggleBulkActions(): void {
    this.showBulkPanel = !this.showBulkPanel;
  }
  
  // Bulk action methods
  bulkVerify(): void {
    // Show confirmation modal
    this.showConfirmationModal(
      'Verify Selected Users', 
      `Are you sure you want to verify ${this.selectedUsers.length} users?`,
      'other',
      'Verify',
      () => {
        // Implement verification logic
        this.showToastNotification('Success', `${this.selectedUsers.length} users have been verified`, 'success');
        this.loadUsers();
        this.selectedUsers = [];
        this.closeConfirmModal();
      }
    );
  }
  
  bulkActivate(): void {
    this.showConfirmationModal(
      'Activate Selected Users', 
      `Are you sure you want to activate ${this.selectedUsers.length} users?`,
      'activate',
      'Activate',
      () => {
        // Implement activation logic
        const promises = this.selectedUsers.map(user => 
          this.usersService.toggleUserBan(user.id, false).toPromise()
        );
        
        Promise.all(promises)
          .then(() => {
            this.showToastNotification('Success', `${this.selectedUsers.length} users have been activated`, 'success');
            this.loadUsers();
            this.selectedUsers = [];
            this.closeConfirmModal();
          })
          .catch(error => {
            this.showToastNotification('Error', `Failed to activate users: ${error.message}`, 'error');
          });
      }
    );
  }
  
  bulkSuspend(): void {
    this.showConfirmationModal(
      'Suspend Selected Users', 
      `Are you sure you want to suspend ${this.selectedUsers.length} users?`,
      'suspend',
      'Suspend',
      () => {
        // Implement suspension logic
        const promises = this.selectedUsers.map(user => 
          this.usersService.toggleUserBan(user.id, true, 'Administrative action').toPromise()
        );
        
        Promise.all(promises)
          .then(() => {
            this.showToastNotification('Success', `${this.selectedUsers.length} users have been suspended`, 'success');
            this.loadUsers();
            this.selectedUsers = [];
            this.closeConfirmModal();
          })
          .catch(error => {
            this.showToastNotification('Error', `Failed to suspend users: ${error.message}`, 'error');
          });
      }
    );
  }
  
  bulkDelete(): void {
    this.showConfirmationModal(
      'Delete Selected Users', 
      `Are you sure you want to permanently delete ${this.selectedUsers.length} users? This action cannot be undone.`,
      'delete',
      'Delete',
      () => {
        // Implement deletion logic
        const promises = this.selectedUsers.map(user => 
          this.usersService.deleteUser(user.id).toPromise()
        );
        
        Promise.all(promises)
          .then(() => {
            this.showToastNotification('Success', `${this.selectedUsers.length} users have been deleted`, 'success');
            this.loadUsers();
            this.selectedUsers = [];
            this.closeConfirmModal();
          })
          .catch(error => {
            this.showToastNotification('Error', `Failed to delete users: ${error.message}`, 'error');
          });
      }
    );
  }
  
  // User actions
  toggleActionMenu(userId: string): void {
    if (this.activeActionMenu === userId) {
      this.activeActionMenu = null;
    } else {
      this.activeActionMenu = userId;
    }
  }
  
  showAddUserModal(): void {
    this.isEditMode = false;
    this.userForm.reset({
      role: 'jobseeker',
      status: 'active',
      isVerified: false
    });
    
    // Make password required for new users
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.showModal = true;
  }
  
  editUser(user: User): void {
    this.isEditMode = true;
    this.selectedUser = user;
    
    // Remove password validation for editing
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status || 'active',
      isVerified: user.isVerified || false
    });
    
    this.showModal = true;
    this.closeDetailsModal();
  }
  
  saveUser(): void {
    if (this.userForm.invalid) {
      return;
    }
    
    const userData = this.userForm.value;
    
    if (this.isEditMode && this.selectedUser) {
      // Update existing user
      this.usersService.updateUser(this.selectedUser.id, userData).subscribe({
        next: (updatedUser) => {
          this.showToastNotification('Success', 'User updated successfully', 'success');
          this.closeModal();
          this.loadUsers();
        },
        error: (error) => {
          this.showToastNotification('Error', `Failed to update user: ${error.message}`, 'error');
        }
      });
    } else {
      // Create new user
      this.usersService.createUser(userData).subscribe({
        next: (newUser) => {
          this.showToastNotification('Success', 'User created successfully', 'success');
          this.closeModal();
          this.loadUsers();
        },
        error: (error) => {
          this.showToastNotification('Error', `Failed to create user: ${error.message}`, 'error');
        }
      });
    }
  }
  
  viewUserDetails(user: User): void {
    this.selectedUser = user;
    this.currentTab = 'activity';
    this.showDetailsModal = true;
    this.activeActionMenu = null;
    
    // Load user activity logs
    this.loadUserActivityLogs(user.id);
  }
  
  loadUserActivityLogs(userId: string): void {
    this.usersService.getUserActivityLogs(userId).subscribe({
      next: (logs) => {
        this.userActivityLog = logs;
      },
      error: (error) => {
        console.error('Failed to load activity logs:', error);
        this.userActivityLog = [];
      }
    });
    
    // Mock data for sessions (replace with actual API call if available)
    this.userSessions = [
      {
        id: '1',
        device: 'Chrome on Windows',
        location: 'New York, US',
        ip: '192.168.1.1',
        active: true,
        lastActive: new Date()
      },
      {
        id: '2',
        device: 'Mobile Safari on iPhone',
        location: 'San Francisco, US',
        ip: '192.168.1.2',
        active: false,
        lastActive: new Date(Date.now() - 86400000)
      }
    ];
    
    // Mock data for admin notes (replace with actual API call if available)
    this.adminNotes = [
      {
        id: '1',
        title: 'Account Verification',
        content: 'User verified their email address and completed profile information.',
        adminName: 'Admin User',
        createdAt: new Date(Date.now() - 86400000 * 3)
      }
    ];
  }
  
  // User actions
  verifyUser(user: User): void {
    // Implement verification logic
    const updatedUser = { ...user, isVerified: true };
    this.usersService.updateUser(user.id, updatedUser).subscribe({
      next: () => {
        this.showToastNotification('Success', 'User verified successfully', 'success');
        this.loadUsers();
      },
      error: (error) => {
        this.showToastNotification('Error', `Failed to verify user: ${error.message}`, 'error');
      }
    });
  }
  
  activateUser(user: User): void {
    // Implement activation logic
    this.usersService.toggleUserBan(user.id, false).subscribe({
      next: () => {
        this.showToastNotification('Success', 'User activated successfully', 'success');
        this.loadUsers();
        this.activeActionMenu = null;
      },
      error: (error) => {
        this.showToastNotification('Error', `Failed to activate user: ${error.message}`, 'error');
      }
    });
  }
  
  suspendUser(user: User): void {
    this.showConfirmationModal(
      'Suspend User',
      `Are you sure you want to suspend ${user.firstName} ${user.lastName}'s account?`,
      'suspend',
      'Suspend',
      () => {
        this.usersService.toggleUserBan(user.id, true, 'Administrative action').subscribe({
          next: () => {
            this.showToastNotification('Success', 'User suspended successfully', 'success');
            this.loadUsers();
            this.closeConfirmModal();
            this.activeActionMenu = null;
          },
          error: (error) => {
            this.showToastNotification('Error', `Failed to suspend user: ${error.message}`, 'error');
          }
        });
      }
    );
  }
  
  changeRole(user: User): void {
    // Prepare a simple role change UI or modal
    const newRole = user.role === 'jobseeker' ? 'employer' : 
                    user.role === 'employer' ? 'admin' : 'jobseeker';
    
    this.showConfirmationModal(
      'Change User Role',
      `Are you sure you want to change ${user.firstName} ${user.lastName}'s role from ${user.role} to ${newRole}?`,
      'other',
      'Change Role',
      () => {
        this.usersService.changeUserRole(user.id, newRole).subscribe({
          next: () => {
            this.showToastNotification('Success', `User role changed to ${newRole}`, 'success');
            this.loadUsers();
            this.closeConfirmModal();
            this.activeActionMenu = null;
          },
          error: (error) => {
            this.showToastNotification('Error', `Failed to change user role: ${error.message}`, 'error');
          }
        });
      }
    );
  }
  
  
  deleteUser(user: User): void {
    this.showConfirmationModal(
      'Delete User',
      `Are you sure you want to permanently delete ${user.firstName} ${user.lastName}'s account? This action cannot be undone.`,
      'delete',
      'Delete',
      () => {
        this.usersService.deleteUser(user.id).subscribe({
          next: () => {
            this.showToastNotification('Success', 'User deleted successfully', 'success');
            this.loadUsers();
            this.closeConfirmModal();
            this.activeActionMenu = null;
          },
          error: (error) => {
            this.showToastNotification('Error', `Failed to delete user: ${error.message}`, 'error');
          }
        });
      }
    );
  }
  
  // Modal methods
  closeModal(): void {
    this.showModal = false;
    this.userForm.reset();
  }
  
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedUser = null;
  }
  
  // Confirm modal methods
  showConfirmationModal(
    title: string, 
    message: string, 
    type: 'delete' | 'suspend' | 'activate' | 'other',
    buttonText: string,
    confirmFn: Function
  ): void {
    this.confirmModalTitle = title;
    this.confirmModalMessage = message;
    this.confirmModalType = type;
    this.confirmButtonText = buttonText;
    this.confirmAction = confirmFn;
    this.showConfirmModal = true;
  }
  
  closeConfirmModal(): void {
    this.showConfirmModal = false;
  }
  
  // User details tab methods
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  toggleTwoFactor(): void {
    if (this.selectedUser) {
      this.selectedUser.twoFactorEnabled = !this.selectedUser.twoFactorEnabled;
      this.showToastNotification(
        'Success', 
        `Two-factor authentication ${this.selectedUser.twoFactorEnabled ? 'enabled' : 'disabled'}`, 
        'success'
      );
    }
  }
  
  terminateSession(session: any): void {
    // Implement session termination
    this.showToastNotification('Success', 'Session terminated successfully', 'success');
    session.active = false;
  }
  
  addNote(): void {
    if (this.noteForm.invalid) {
      return;
    }
    
    const newNote = {
      id: Date.now().toString(),
      title: this.noteForm.value.title,
      content: this.noteForm.value.content,
      adminName: this.authService.currentUserValue?.firstName + ' ' + this.authService.currentUserValue?.lastName || 'Admin',
      createdAt: new Date()
    };
    
    this.adminNotes.unshift(newNote);
    this.noteForm.reset();
    this.showToastNotification('Success', 'Note added successfully', 'success');
  }
  
  deleteNote(note: any): void {
    const index = this.adminNotes.findIndex(n => n.id === note.id);
    if (index !== -1) {
      this.adminNotes.splice(index, 1);
      this.showToastNotification('Success', 'Note deleted successfully', 'success');
    }
  }
  
  lockAccount(): void {
    this.showToastNotification('Success', 'Account locked successfully', 'success');
  }
  
  forceLogout(): void {
    this.showToastNotification('Success', 'User has been forced to log out from all devices', 'success');
    this.userSessions.forEach(session => session.active = false);
  }
  
  deleteUserData(): void {
    this.showConfirmationModal(
      'Delete User Data',
      'Are you sure you want to delete all user data? This action cannot be undone.',
      'delete',
      'Delete Data',
      () => {
        this.showToastNotification('Success', 'User data deleted successfully', 'success');
        this.closeConfirmModal();
      }
    );
  }
  
  // Toast notification methods
  showToastNotification(title: string, message: string, type: 'success' | 'warning' | 'error' | 'info'): void {
    // Clear existing timeout if there's one
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      clearInterval(this.toastProgressInterval);
    }
    
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastType = type;
    this.toastProgress = 100;
    this.showToast = true;
    
    // Set up progress bar countdown
    const intervalTime = 30;
    const durationMs = 5000;
    const decrementAmount = (intervalTime / durationMs) * 100;
    
    this.toastProgressInterval = setInterval(() => {
      this.toastProgress -= decrementAmount;
      if (this.toastProgress <= 0) {
        clearInterval(this.toastProgressInterval);
      }
    }, intervalTime);
    
    // Auto-close toast after duration
    this.toastTimeout = setTimeout(() => {
      this.closeToast();
    }, durationMs);
  }
  
  closeToast(): void {
    this.showToast = false;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      clearInterval(this.toastProgressInterval);
    }
  }
  
  // Properties for progress interval
  private toastProgressInterval: any;
}
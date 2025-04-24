import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { CommonModule } from '@angular/common';
import { SidebarAdminComponent } from '../../../components/sidebar-admin/sidebar-admin.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports : [CommonModule,FormsModule,ReactiveFormsModule,SidebarAdminComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  // User data and pagination
  users: any[] = [];
  filteredUsers: any[] = [];
  totalUsers: number = 0;
  activeUsers: number = 0;
  pendingUsers: number = 0;
  suspendedUsers: number = 0;
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  
  // Sorting and filtering
  sortField: string = 'createdAt';
  sortOrder: string = 'desc';
  searchTerm: string = '';
  filterRole: string = 'all';
  filterStatus: string = 'all';
  filterVerified: string = 'all';
  
  // Selection
  selectedUsers: any[] = [];
  showBulkPanel: boolean = false;
  
  // Modals
  showModal: boolean = false;
  showDetailsModal: boolean = false;
  showConfirmModal: boolean = false;
  isEditMode: boolean = false;
  showPassword: boolean = false;
  
  // Forms
  userForm: FormGroup;
  noteForm: FormGroup;
  
  // Selected user details
  selectedUser: any;
  userActivityLog: any[] = [];
  userSessions: any[] = [];
  adminNotes: any[] = [];
  currentTab: string = 'activity';
  
  // Confirmation modal
  confirmModalType: string = '';
  confirmModalTitle: string = '';
  confirmModalMessage: string = '';
  confirmButtonText: string = '';
  confirmAction: Function = () => {};
  
  // Toast notifications
  showToast: boolean = false;
  toastType: string = '';
  toastTitle: string = '';
  toastMessage: string = '';
  toastProgress: number = 100;
  toastTimeout: any;
  
  // Make Math available in template
  Math = Math;
  
  // Action menu control
  activeActionMenu: any = null;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService
  ) {
    this.userForm = this.fb.group({
      id: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      role: ['jobseeker'],
      status: ['active'],
      isVerified: [false]
    });
    
    this.noteForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('UserManagementComponent initialized');
    this.loadUsers();
    this.updateUserStats();
  }

  loadUsers(): void {
    console.log(`Loading users with current page: ${this.currentPage} pageSize: ${this.pageSize} role: ${this.filterRole} search: ${this.searchTerm}`);
    
    this.usersService.getAllUsers(this.currentPage, this.pageSize, this.filterRole, this.searchTerm).subscribe({
      next: (data) => {
        // Ensure user IDs are strings for consistency
        this.users = data.users.map(user => ({
          ...user,
          id: user.id.toString() // Convert all IDs to strings
        }));
        this.totalUsers = data.pagination.totalUsers;
        this.filterUsers();
        this.updateUserStats();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.showNotification('error', 'Error', 'Failed to load users. Please try again later.');
      }
    });
  }

  updateUserStats(): void {
    // For this example, we'll calculate stats from current users
    this.activeUsers = this.users.filter(user => user.status === 'active').length;
    this.pendingUsers = this.users.filter(user => user.status === 'pending').length;
    this.suspendedUsers = this.users.filter(user => user.status === 'suspended').length;
  }

  filterUsers(): void {
    this.filteredUsers = [...this.users];
    
    // Apply role filter
    if (this.filterRole !== 'all') {
      this.filteredUsers = this.filteredUsers.filter(user => user.role === this.filterRole);
    }
    
    // Apply status filter
    if (this.filterStatus !== 'all') {
      this.filteredUsers = this.filteredUsers.filter(user => user.status === this.filterStatus);
    }
    
    // Apply verification filter
    if (this.filterVerified !== 'all') {
      this.filteredUsers = this.filteredUsers.filter(user => 
        (this.filterVerified === 'verified' && user.isVerified) || 
        (this.filterVerified === 'unverified' && !user.isVerified)
      );
    }
    
    // Apply search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.filteredUsers.filter(user => 
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.id.toString().includes(term)
      );
    }
    
    // Apply sorting
    this.applySorting();
  }
  
  resetFilters(): void {
    this.filterRole = 'all';
    this.filterStatus = 'all';
    this.filterVerified = 'all';
    this.searchTerm = '';
    this.filterUsers();
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      // Toggle sort order if same field
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.applySorting();
  }
  
  applySorting(): void {
    this.filteredUsers.sort((a, b) => {
      let valueA = a[this.sortField];
      let valueB = b[this.sortField];
      
      // Handle strings case-insensitively
      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();
      
      if (valueA < valueB) return this.sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  // Pagination methods
  goToPage(page: string | number): void {
    // Convert page to number if it's a string
    const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
    
    // Continue with your existing logic
    if (pageNumber < 1 || pageNumber > this.getTotalPages()) return;
    this.currentPage = pageNumber;
    this.loadUsers();
  }
  
  getTotalPages(): number {
    return Math.ceil(this.totalUsers / this.pageSize);
  }
  
  getPaginationArray(): (number | string)[] {
    const result: (number | string)[] = [];
    const totalPages = this.getTotalPages();
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
    } else {
      // Always include first page
      result.push(1);
      
      // Calculate range around current page
      let startPage = Math.max(2, this.currentPage - 1);
      let endPage = Math.min(totalPages - 1, this.currentPage + 1);
      
      // Adjust if at boundaries
      if (this.currentPage <= 3) {
        endPage = 4;
      } else if (this.currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        result.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        result.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        result.push('...');
      }
      
      // Always include last page
      result.push(totalPages);
    }
    
    return result;
  }
  
  // User selection methods
  toggleUserSelection(user: any): void {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    if (index === -1) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(index, 1);
    }
  }
  
  isUserSelected(userId: any): boolean {
    return this.selectedUsers.some(user => user.id === userId);
  }
  
  toggleAllUsers(): void {
    if (this.areAllUsersSelected()) {
      this.selectedUsers = [];
    } else {
      this.selectedUsers = [...this.filteredUsers];
    }
  }
  
  areAllUsersSelected(): boolean {
    return this.filteredUsers.length > 0 && this.selectedUsers.length === this.filteredUsers.length;
  }
  
  toggleBulkActions(): void {
    this.showBulkPanel = !this.showBulkPanel;
  }
  
  // Bulk actions
  bulkVerify(): void {
    if (this.selectedUsers.length === 0) return;
    
    this.confirmModalType = 'other';
    this.confirmModalTitle = 'Verify Selected Users';
    this.confirmModalMessage = `Are you sure you want to verify ${this.selectedUsers.length} selected users?`;
    this.confirmButtonText = 'Verify Users';
    this.confirmAction = () => {
      // Logic to verify selected users would go here
      this.selectedUsers.forEach(user => {
        user.isVerified = true;
      });
      this.showNotification('success', 'Success', `${this.selectedUsers.length} users have been verified.`);
      this.selectedUsers = [];
      this.showBulkPanel = false;
      this.closeConfirmModal();
    };
    this.showConfirmModal = true;
  }
  
  bulkActivate(): void {
    if (this.selectedUsers.length === 0) return;
    
    this.confirmModalType = 'activate';
    this.confirmModalTitle = 'Activate Selected Users';
    this.confirmModalMessage = `Are you sure you want to activate ${this.selectedUsers.length} selected users?`;
    this.confirmButtonText = 'Activate Users';
    this.confirmAction = () => {
      // Logic to activate selected users would go here
      this.selectedUsers.forEach(user => {
        user.status = 'active';
      });
      this.updateUserStats();
      this.showNotification('success', 'Success', `${this.selectedUsers.length} users have been activated.`);
      this.selectedUsers = [];
      this.showBulkPanel = false;
      this.closeConfirmModal();
    };
    this.showConfirmModal = true;
  }
  
  bulkSuspend(): void {
    if (this.selectedUsers.length === 0) return;
    
    this.confirmModalType = 'suspend';
    this.confirmModalTitle = 'Suspend Selected Users';
    this.confirmModalMessage = `Are you sure you want to suspend ${this.selectedUsers.length} selected users?`;
    this.confirmButtonText = 'Suspend Users';
    this.confirmAction = () => {
      // Logic to suspend selected users would go here
      this.selectedUsers.forEach(user => {
        user.status = 'suspended';
      });
      this.updateUserStats();
      this.showNotification('success', 'Success', `${this.selectedUsers.length} users have been suspended.`);
      this.selectedUsers = [];
      this.showBulkPanel = false;
      this.closeConfirmModal();
    };
    this.showConfirmModal = true;
  }
  
  bulkDelete(): void {
    if (this.selectedUsers.length === 0) return;
    
    this.confirmModalType = 'delete';
    this.confirmModalTitle = 'Delete Selected Users';
    this.confirmModalMessage = `Are you sure you want to permanently delete ${this.selectedUsers.length} selected users? This action cannot be undone.`;
    this.confirmButtonText = 'Delete Users';
    this.confirmAction = () => {
      // Logic to delete selected users would go here
      this.users = this.users.filter(user => !this.selectedUsers.some(u => u.id === user.id));
      this.filterUsers();
      this.updateUserStats();
      this.showNotification('success', 'Success', `${this.selectedUsers.length} users have been deleted.`);
      this.selectedUsers = [];
      this.showBulkPanel = false;
      this.closeConfirmModal();
    };
    this.showConfirmModal = true;
  }
  
  // User action methods
  toggleActionMenu(userId: any): void {
    if (this.activeActionMenu === userId) {
      this.activeActionMenu = null;
    } else {
      this.activeActionMenu = userId;
    }
  }
  
  viewUserDetails(user: any): void {
    this.selectedUser = user;
    this.currentTab = 'activity';
    this.activeActionMenu = null;
    this.loadUserDetails();
    this.showDetailsModal = true;
  }
  
  loadUserDetails(): void {
    // In a real app, you would fetch this data from your API
    // For this example, we'll use mock data
    
    // Mock activity log
    this.userActivityLog = [
      {
        type: 'Login',
        description: 'User logged in from a new device',
        createdAt: new Date(2023, 3, 15, 14, 30),
        metadata: {
          'IP Address': '192.168.1.1',
          'Device': 'Chrome on Windows'
        }
      },
      {
        type: 'Profile Update',
        description: 'User updated their profile information',
        createdAt: new Date(2023, 3, 10, 9, 45),
        metadata: {
          'Fields': 'Name, Phone Number'
        }
      },
      {
        type: 'Password Change',
        description: 'User changed their password',
        createdAt: new Date(2023, 2, 28, 16, 20),
        metadata: null
      }
    ];
    
    // Mock sessions
    this.userSessions = [
      {
        id: '1',
        device: 'Chrome on Windows',
        ip: '192.168.1.1',
        location: 'New York, US',
        lastActive: new Date(2023, 3, 16, 10, 30),
        active: true
      },
      {
        id: '2',
        device: 'Safari on iPhone',
        ip: '192.168.1.2',
        location: 'New York, US',
        lastActive: new Date(2023, 3, 15, 14, 30),
        active: false
      }
    ];
    
    // Mock admin notes
    this.adminNotes = [
      {
        id: '1',
        title: 'Account Verification',
        content: 'User verified their identity with government ID',
        adminName: 'Admin User',
        createdAt: new Date(2023, 3, 10, 11, 15)
      },
      {
        id: '2',
        title: 'Support Ticket',
        content: 'User had an issue with password reset, resolved over email',
        adminName: 'Support Team',
        createdAt: new Date(2023, 3, 5, 9, 20)
      }
    ];
  }
  
  editUser(user: any): void {
    this.isEditMode = true;
    this.activeActionMenu = null;
    this.showDetailsModal = false;
    
    // Reset form and set values
    this.userForm.reset();
    this.userForm.patchValue({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified
    });
    
    // Remove password validation in edit mode
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.showModal = true;
  }
  
  showAddUserModal(): void {
    this.isEditMode = false;
    
    // Reset form
    this.userForm.reset({
      role: 'jobseeker',
      status: 'active',
      isVerified: false
    });
    
    // Add password validation for new users
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.showModal = true;
  }
  
  closeModal(): void {
    this.showModal = false;
  }
  
  saveUser(): void {
    if (this.userForm.invalid) return;
    
    const userData = this.userForm.value;
    
    if (this.isEditMode) {
      // Update existing user
      const index = this.users.findIndex(u => u.id === userData.id);
      if (index !== -1) {
        this.users[index] = {
          ...this.users[index],
          ...userData,
          updatedAt: new Date()
        };
        this.showNotification('success', 'Success', 'User updated successfully.');
      }
    } else {
      // Create new user
      const newUser = {
        ...userData,
        id: Date.now().toString(), // Generate a unique ID
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: null
      };
      this.users.unshift(newUser);
      this.totalUsers++;
      this.showNotification('success', 'Success', 'User created successfully.');
    }
    
    this.filterUsers();
    this.updateUserStats();
    this.closeModal();
  }
  
  resetPassword(user: any): void {
    this.activeActionMenu = null;
    
    this.confirmModalType = 'other';
    this.confirmModalTitle = 'Reset User Password';
    this.confirmModalMessage = `Are you sure you want to reset the password for ${user.firstName} ${user.lastName}? A new password will be generated and sent to their email.`;
    this.confirmButtonText = 'Reset Password';
    this.confirmAction = () => {
      // Logic to reset password would go here
      this.showNotification('success', 'Success', `Password reset email has been sent to ${user.email}.`);
      this.closeConfirmModal();
    };
    this.showConfirmModal = true;
  }
  
  changeRole(user: any): void {
    this.activeActionMenu = null;
    
    this.confirmModalType = 'other';
    this.confirmModalTitle = 'Change User Role';
    this.confirmModalMessage = `Current role: ${user.role}. Please select a new role for ${user.firstName} ${user.lastName}.`;
    this.confirmButtonText = 'Change Role';
    this.confirmAction = () => {
      // Logic to change role would go here
      // In a real app, you would show a role selection UI
      this.showNotification('success', 'Success', `User role has been updated.`);
      this.closeConfirmModal();
    };
    this.showConfirmModal = true;
  }
  
  suspendUser(user: any): void {
    this.activeActionMenu = null;
    
    this.confirmModalType = 'suspend';
    this.confirmModalTitle = 'Suspend User';
    this.confirmModalMessage = `Are you sure you want to suspend ${user.firstName} ${user.lastName}? They will not be able to access their account until reactivated.`;
    this.confirmButtonText = 'Suspend User';
    this.confirmAction = () => {
      // Logic to suspend user would go here
      const index = this.users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        this.users[index].status = 'suspended';
        this.updateUserStats();
        this.filterUsers();
        this.showNotification('warning', 'User Suspended', `${user.firstName} ${user.lastName}'s account has been suspended.`);
      }
      this.closeConfirmModal();
    };
    this.showConfirmModal = true;
  }
  
  activateUser(user: any): void {
    this.activeActionMenu = null;
    
    this.confirmModalType = 'activate';
    this.confirmModalTitle = 'Activate User';
    this.confirmModalMessage = `Are you sure you want to activate ${user.firstName} ${user.lastName}? They will regain full access to their account.`;
    this.confirmButtonText = 'Activate User';
    this.confirmAction = () => {
      // Logic to activate user would go here
      const index = this.users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        this.users[index].status = 'active';
        this.updateUserStats();
        this.filterUsers();
        this.showNotification('success', 'User Activated', `${user.firstName} ${user.lastName}'s account has been activated.`);
      }
      this.closeConfirmModal();
    };
    this.showConfirmModal = true;
  }
  
  deleteUser(user: any): void {
    this.activeActionMenu = null;
    
    this.confirmModalType = 'delete';
    this.confirmModalTitle = 'Delete User';
    this.confirmModalMessage = `Are you sure you want to permanently delete ${user.firstName} ${user.lastName}? This action cannot be undone.`;
    this.confirmButtonText = 'Delete User';
    this.confirmAction = () => {
      // Logic to delete user would go here
      this.users = this.users.filter(u => u.id !== user.id);
      this.totalUsers--;
      this.updateUserStats();
      this.filterUsers();
      this.showNotification('success', 'User Deleted', `${user.firstName} ${user.lastName}'s account has been deleted.`);
      this.closeConfirmModal();
    };
    this.showConfirmModal = true;
  }
  
  verifyUser(user: any): void {
    // Logic to verify user would go here
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users[index].isVerified = true;
      this.filterUsers();
      this.showNotification('success', 'User Verified', `${user.firstName} ${user.lastName} has been verified.`);
    }
  }
  
  // User details modal methods
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedUser = null;
  }
  
  toggleTwoFactor(): void {
    if (this.selectedUser) {
      this.selectedUser.twoFactorEnabled = !this.selectedUser.twoFactorEnabled;
      this.showNotification('success', 'Two-Factor Authentication', 
        this.selectedUser.twoFactorEnabled ? 'Two-factor authentication has been enabled.' : 'Two-factor authentication has been disabled.');
    }
  }
  
  lockAccount(): void {
    this.confirmModalType = 'other';
    this.confirmModalTitle = 'Lock User Account';
    this.confirmModalMessage = `Are you sure you want to lock ${this.selectedUser.firstName} ${this.selectedUser.lastName}'s account? They will be logged out and unable to log in until the account is unlocked.`;
    this.confirmButtonText = 'Lock Account';
    this.confirmAction = () => {
      // Logic to lock account would go here
      this.showNotification('warning', 'Account Locked', `${this.selectedUser.firstName} ${this.selectedUser.lastName}'s account has been locked.`);
      this.closeConfirmModal();
    };
    this.showConfirmModal = true;
  }
  
  forceLogout(): void {
    this.confirmModalType = 'other';
    this.confirmModalTitle = 'Force Logout';
    this.confirmModalMessage = `Are you sure you want to force ${this.selectedUser.firstName} ${this.selectedUser.lastName} to log out of all active sessions?`;
    this.confirmButtonText = 'Force Logout';
    this.confirmAction = () => {
      // Logic to force logout would go here
      this.userSessions = this.userSessions.map(session => ({...session, active: false}));
      this.showNotification('info', 'Forced Logout', `${this.selectedUser.firstName} ${this.selectedUser.lastName} has been logged out of all sessions.`);
      this.closeConfirmModal();
    };
    this.showConfirmModal = true;
  }
  
  deleteUserData(): void {
    this.confirmModalType = 'delete';
    this.confirmModalTitle = 'Delete User Data';
    this.confirmModalMessage = `Are you sure you want to delete all data associated with ${this.selectedUser.firstName} ${this.selectedUser.lastName}? This action cannot be undone.`;
    this.confirmButtonText = 'Delete Data';
    this.confirmAction = () => {
      // Logic to delete user data would go here
      this.showNotification('success', 'Data Deleted', `All data for ${this.selectedUser.firstName} ${this.selectedUser.lastName} has been deleted.`);
      this.closeConfirmModal();
    };
    this.showConfirmModal = true;
  }
  
  terminateSession(session: any): void {
    this.confirmModalType = 'other';
    this.confirmModalTitle = 'Terminate Session';
    this.confirmModalMessage = `Are you sure you want to terminate this session on ${session.device}?`;
    this.confirmButtonText = 'Terminate';
    this.confirmAction = () => {
      // Logic to terminate session would go here
      const index = this.userSessions.findIndex(s => s.id === session.id);
      if (index !== -1) {
        this.userSessions[index].active = false;
      }
      this.showNotification('info', 'Session Terminated', `The session on ${session.device} has been terminated.`);
      this.closeConfirmModal();
    };
    this.showConfirmModal = true;
  }
  
  addNote(): void {
    if (this.noteForm.invalid) return;
    
    // Add note to the list
    const newNote = {
      id: Date.now().toString(),
      title: this.noteForm.value.title,
      content: this.noteForm.value.content,
      adminName: 'Current Admin', // In a real app, this would be the current admin's name
      createdAt: new Date()
    };
    
    this.adminNotes.unshift(newNote);
    this.noteForm.reset();
    this.showNotification('success', 'Note Added', 'Admin note has been added successfully.');
  }
  
  deleteNote(note: any): void {
    this.confirmModalType = 'delete';
    this.confirmModalTitle = 'Delete Note';
    this.confirmModalMessage = `Are you sure you want to delete this note?`;
    this.confirmButtonText = 'Delete';
    this.confirmAction = () => {
      // Logic to delete note would go here
      this.adminNotes = this.adminNotes.filter(n => n.id !== note.id);
      this.showNotification('success', 'Note Deleted', 'Admin note has been deleted.');
      this.closeConfirmModal();
    };
    this.showConfirmModal = true;
  }
  
  // Password visibility toggle
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  // Confirmation modal methods
  closeConfirmModal(): void {
    this.showConfirmModal = false;
  }
  
  // Toast notification methods
  showNotification(type: string, title: string, message: string): void {
    // Clear any existing timeout
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      clearInterval(this.toastTimeout);
    }
    
    // Set toast properties
    this.toastType = type;
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastProgress = 100;
    this.showToast = true;
    
    // Auto-close after 5 seconds with progress animation
    let progress = 100;
    const interval = setInterval(() => {
      progress -= 2;
      this.toastProgress = progress;
      if (progress <= 0) {
        clearInterval(interval);
        this.closeToast();
      }
    }, 100);
    
    this.toastTimeout = interval;
  }
  
  closeToast(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      clearInterval(this.toastTimeout);
    }
    this.showToast = false;
  }
}
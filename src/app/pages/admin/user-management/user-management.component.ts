import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarAdminComponent } from '../../../components/sidebar-admin/sidebar-admin.component';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'employer' | 'jobseeker';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  isVerified: boolean;
  createdAt: Date;
  lastActive: Date;
  passwordLastChanged?: Date;
  twoFactorEnabled?: boolean;
}

interface ActivityLog {
  id: string;
  description: string;
  timestamp: Date;
  ip?: string;
}

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  active: boolean;
  lastActive: Date;
}

interface Note {
  id: string;
  title: string;
  content: string;
  adminName: string;
  createdAt: Date;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarAdminComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  // Make Math available for template
  Math = Math;
  
  // User data
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUsers: User[] = [];
  selectedUser: User | null = null;
  
  // Filters
  searchTerm: string = '';
  filterRole: string = 'all';
  filterStatus: string = 'all';
  filterVerified: string = 'all';
  
  // Sorting
  sortField: keyof User = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  
  // UI States
  showBulkPanel: boolean = false;
  activeActionMenu: string | null = null;
  
  // Modals
  showModal: boolean = false;
  isEditMode: boolean = false;
  userForm: FormGroup;
  showPassword: boolean = false;
  
  showDetailsModal: boolean = false;
  currentTab: string = 'activity';
  userActivityLog: ActivityLog[] = [];
  userSessions: Session[] = [];
  adminNotes: Note[] = [];
  noteForm: FormGroup;
  
  showConfirmModal: boolean = false;
  confirmModalTitle: string = '';
  confirmModalMessage: string = '';
  confirmModalType: 'delete' | 'suspend' | 'activate' | 'other' = 'other';
  confirmButtonText: string = 'Confirm';
  pendingAction: Function | null = null;
  
  // Toast notification
  isToastVisible: boolean = false; // Renamed from 'showToast' to 'isToastVisible'
  toastTitle: string = '';
  toastMessage: string = '';
  toastType: 'success' | 'warning' | 'error' | 'info' = 'success';
  toastProgress: number = 100;
  toastTimer: any = null;
  
  // Stats
  totalUsers: number = 0;
  activeUsers: number = 0;
  pendingUsers: number = 0;
  suspendedUsers: number = 0;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      id: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['jobseeker', Validators.required],
      status: ['active', Validators.required],
      isVerified: [false]
    });
    
    this.noteForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Generate dummy data
    this.generateDummyData();
    this.calculateStats();
    this.filterUsers();
  }
  
  generateDummyData(): void {
    const roles: ('admin' | 'employer' | 'jobseeker')[] = ['admin', 'employer', 'jobseeker'];
    const statuses: ('active' | 'inactive' | 'pending' | 'suspended')[] = ['active', 'inactive', 'pending', 'suspended'];
    
    for (let i = 1; i <= 57; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const isVerified = Math.random() > 0.3;
      
      const user: User = {
        id: this.generateRandomId(),
        firstName: `User${i}`,
        lastName: `Sample`,
        email: `user${i}@example.com`,
        role: role,
        status: status,
        isVerified: isVerified,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        passwordLastChanged: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
        twoFactorEnabled: Math.random() > 0.7
      };
      
      this.users.push(user);
    }
  }

  calculateStats(): void {
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(user => user.status === 'active').length;
    this.pendingUsers = this.users.filter(user => user.status === 'pending').length;
    this.suspendedUsers = this.users.filter(user => user.status === 'suspended').length;
  }

  filterUsers(): void {
    let result = [...this.users];
    
    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      result = result.filter(user => 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.id.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply role filter
    if (this.filterRole !== 'all') {
      result = result.filter(user => user.role === this.filterRole);
    }
    
    // Apply status filter
    if (this.filterStatus !== 'all') {
      result = result.filter(user => user.status === this.filterStatus);
    }
    
    // Apply verification filter
    if (this.filterVerified !== 'all') {
      result = result.filter(user => 
        (this.filterVerified === 'verified' && user.isVerified) ||
        (this.filterVerified === 'unverified' && !user.isVerified)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[this.sortField];
      const bValue = b[this.sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        return this.sortOrder === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      } else {
        return 0;
      }
    });
    
    this.filteredUsers = result;
    this.currentPage = 1; // Reset to first page after filtering
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterRole = 'all';
    this.filterStatus = 'all';
    this.filterVerified = 'all';
    this.filterUsers();
  }

  sortBy(field: keyof User): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.filterUsers();
  }

  // Pagination methods
  getTotalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  // Change your goToPage method to handle both string and number
goToPage(page: string | number): void {
  this.currentPage = typeof page === 'string' ? parseInt(page, 10) : page;
  // rest of your pagination logic
}

  getPaginationArray(): (number | string)[] {
    const totalPages = this.getTotalPages();
    const currentPage = this.currentPage;
    let result: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
    } else {
      // Always include first page
      result.push(1);
      
      // Add dots if current page is > 3
      if (currentPage > 3) {
        result.push('...');
      }
      
      // Add pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        result.push(i);
      }
      
      // Add dots if current page is < totalPages - 2
      if (currentPage < totalPages - 2) {
        result.push('...');
      }
      
      // Always include last page
      if (totalPages > 1) {
        result.push(totalPages);
      }
    }
    
    return result;
  }

  // User selection methods
  toggleUserSelection(user: User): void {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(user);
    }
  }

  isUserSelected(id: string): boolean {
    return this.selectedUsers.some(user => user.id === id);
  }

  areAllUsersSelected(): boolean {
    const currentPageUsers = this.getCurrentPageUsers();
    return currentPageUsers.length > 0 && currentPageUsers.every(user => this.isUserSelected(user.id));
  }

  toggleAllUsers(): void {
    const currentPageUsers = this.getCurrentPageUsers();
    
    if (this.areAllUsersSelected()) {
      // Deselect all users on current page
      this.selectedUsers = this.selectedUsers.filter(user => 
        !currentPageUsers.some(pageUser => pageUser.id === user.id)
      );
    } else {
      // Select all users on current page
      const userIdsToAdd = currentPageUsers
        .filter(user => !this.isUserSelected(user.id))
        .map(user => user);
      
      this.selectedUsers = [...this.selectedUsers, ...userIdsToAdd];
    }
  }

  getCurrentPageUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredUsers.length);
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  toggleBulkActions(): void {
    this.showBulkPanel = !this.showBulkPanel;
  }

  // Action menu methods
  toggleActionMenu(userId: string): void {
    this.activeActionMenu = this.activeActionMenu === userId ? null : userId;
  }

  // User form methods
  showAddUserModal(): void {
    this.isEditMode = false;
    this.userForm.reset({
      role: 'jobseeker',
      status: 'active',
      isVerified: false
    });
    this.showModal = true;
  }

  editUser(user: User): void {
    this.isEditMode = true;
    
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
    if (this.isEditMode) {
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }
    
    this.closeDetailsModal();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  saveUser(): void {
    if (this.userForm.invalid) return;
    
    const formData = this.userForm.value;
    
    if (this.isEditMode) {
      // Update existing user
      const index = this.users.findIndex(u => u.id === formData.id);
      if (index > -1) {
        this.users[index] = {
          ...this.users[index],
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          isVerified: formData.isVerified
        };
        
        this.showToast('User updated', `${formData.firstName} ${formData.lastName}'s profile has been updated successfully`, 'success');
      }
    } else {
      // Add new user
      const newUser: User = {
        id: this.generateRandomId(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        isVerified: formData.isVerified,
        createdAt: new Date(),
        lastActive: new Date()
      };
      
      this.users.unshift(newUser);
      this.showToast('User added', `${formData.firstName} ${formData.lastName} has been added successfully`, 'success');
    }
    
    this.calculateStats();
    this.filterUsers();
    this.closeModal();
  }

  // User details modal methods
  viewUserDetails(user: User): void {
    this.selectedUser = user;
    this.activeActionMenu = null;
    this.generateUserActivity();
    this.generateUserSessions();
    this.generateAdminNotes();
    this.currentTab = 'activity';
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedUser = null;
  }

  generateUserActivity(): void {
    // In a real app, these would come from an API call
    this.userActivityLog = [];
    
    if (!this.selectedUser) return;
    
    const activityTypes = [
      'Logged in from new device',
      'Updated profile information',
      'Changed password',
      'Uploaded new document',
      'Applied for job',
      'Updated skills',
      'Viewed job posting',
      'Created new job posting',
      'Account created'
    ];
    
    // Add 5-10 random activities
    const numActivities = 5 + Math.floor(Math.random() * 6);
    for (let i = 0; i < numActivities; i++) {
      const activity = {
        id: this.generateRandomId(),
        description: activityTypes[Math.floor(Math.random() * activityTypes.length)],
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        ip: Math.random() > 0.3 ? `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : undefined
      };
      
      this.userActivityLog.push(activity);
    }
    
    // Sort by most recent first
    this.userActivityLog.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  generateUserSessions(): void {
    // In a real app, these would come from an API call
    this.userSessions = [];
    
    if (!this.selectedUser) return;
    
    const devices = [
      'Chrome on Windows',
      'Safari on macOS',
      'Firefox on Ubuntu',
      'Edge on Windows',
      'Chrome on Android',
      'Safari on iOS'
    ];
    
    const locations = [
      'New York, USA',
      'London, UK',
      'Berlin, Germany',
      'Tokyo, Japan',
      'Sydney, Australia',
      'Toronto, Canada'
    ];
    
    // Add 1-3 random sessions
    const numSessions = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numSessions; i++) {
      const active = i === 0 || Math.random() > 0.7;
      
      const session = {
        id: this.generateRandomId(),
        device: devices[Math.floor(Math.random() * devices.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        active: active,
        lastActive: active ? new Date() : new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      };
      
      this.userSessions.push(session);
    }
    
    // Sort by most recent first
    this.userSessions.sort((a, b) => {
      if (a.active && !b.active) return -1;
      if (!a.active && b.active) return 1;
      return b.lastActive.getTime() - a.lastActive.getTime();
    });
  }

  generateAdminNotes(): void {
    // In a real app, these would come from an API call
    this.adminNotes = [];
    
    if (!this.selectedUser) return;
    
    const adminNames = [
      'John Admin',
      'Sara Manager',
      'Mike Supervisor',
      'Alex Support'
    ];
    
    const noteTitles = [
      'Account verification note',
      'Special permissions',
      'Support request',
      'Payment issue',
      'Account history'
    ];
    
    const noteContents = [
      'User has provided all required verification documents.',
      'User requested special access to premium features for a trial period.',
      'User contacted support about login issues - resolved by clearing cookies.',
      'User had issues with payment method - suggested updating card details.',
      'Multiple login attempts from unusual location - advised to change password.',
      'Extended subscription due to service outage during critical period for this employer.',
      'User is a VIP client and should be given priority support when needed.'
    ];
    
    // Add 0-3 random notes
    const numNotes = Math.floor(Math.random() * 4);
    for (let i = 0; i < numNotes; i++) {
      const note = {
        id: this.generateRandomId(),
        title: noteTitles[Math.floor(Math.random() * noteTitles.length)],
        content: noteContents[Math.floor(Math.random() * noteContents.length)],
        adminName: adminNames[Math.floor(Math.random() * adminNames.length)],
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      };
      
      this.adminNotes.push(note);
    }
    
    // Sort by most recent first
    this.adminNotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  addNote(): void {
    if (this.noteForm.invalid || !this.selectedUser) return;
    
    const formData = this.noteForm.value;
    
    const newNote: Note = {
      id: this.generateRandomId(),
      title: formData.title,
      content: formData.content,
      adminName: 'Admin User', // In a real app, this would be the current admin's name
      createdAt: new Date()
    };
    
    this.adminNotes.unshift(newNote);
    this.noteForm.reset();
    this.showToast('Note added', 'Admin note has been added successfully', 'success');
  }

  deleteNote(note: Note): void {
    const index = this.adminNotes.findIndex(n => n.id === note.id);
    if (index > -1) {
      this.adminNotes.splice(index, 1);
      this.showToast('Note deleted', 'Admin note has been deleted successfully', 'success');
    }
  }

  // User actions
  verifyUser(user: User): void {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index > -1) {
      this.users[index] = {
        ...this.users[index],
        isVerified: true
      };
      
      this.filterUsers();
      this.showToast('User verified', `${user.firstName} ${user.lastName}'s account has been verified`, 'success');
    }
  }

  activateUser(user: User): void {
    this.confirmModalTitle = 'Activate User';
    this.confirmModalMessage = `Are you sure you want to activate ${user.firstName} ${user.lastName}'s account?`;
    this.confirmModalType = 'activate';
    this.confirmButtonText = 'Activate';
    
    this.pendingAction = () => {
      const index = this.users.findIndex(u => u.id === user.id);
      if (index > -1) {
        this.users[index] = {
          ...this.users[index],
          status: 'active'
        };
        
        this.calculateStats();
        this.filterUsers();
        this.showToast('User activated', `${user.firstName} ${user.lastName}'s account has been activated`, 'success');
      }
    };
    
    this.showConfirmModal = true;
  }

  suspendUser(user: User): void {
    this.confirmModalTitle = 'Suspend User';
    this.confirmModalMessage = `Are you sure you want to suspend ${user.firstName} ${user.lastName}'s account? They will be unable to access the platform until reactivated.`;
    this.confirmModalType = 'suspend';
    this.confirmButtonText = 'Suspend';
    
    this.pendingAction = () => {
      const index = this.users.findIndex(u => u.id === user.id);
      if (index > -1) {
        this.users[index] = {
          ...this.users[index],
          status: 'suspended'
        };
        
        this.calculateStats();
        this.filterUsers();
        this.showToast('User suspended', `${user.firstName} ${user.lastName}'s account has been suspended`, 'warning');
      }
    };
    
    this.showConfirmModal = true;
  }

  changeRole(user: User): void {
    // Simple role rotation for demo purposes
    const roles: ('admin' | 'employer' | 'jobseeker')[] = ['admin', 'employer', 'jobseeker'];
    const currentIndex = roles.indexOf(user.role);
    const nextIndex = (currentIndex + 1) % roles.length;
    const newRole = roles[nextIndex];
    
    const index = this.users.findIndex(u => u.id === user.id);
    if (index > -1) {
      this.users[index] = {
        ...this.users[index],
        role: newRole
      };
      
      this.filterUsers();
      this.showToast('Role changed', `${user.firstName} ${user.lastName}'s role has been changed to ${newRole}`, 'success');
    }
  }

  resetPassword(user: User | null): void {
    if (!user) return;
    
    this.confirmModalTitle = 'Reset Password';
    this.confirmModalMessage = `Are you sure you want to reset the password for ${user.firstName} ${user.lastName}? They will receive an email with instructions.`;
    this.confirmModalType = 'other';
    this.confirmButtonText = 'Reset Password';
    
    this.pendingAction = () => {
      // In a real app, this would call an API to reset the password
      this.showToast('Password reset', `A password reset email has been sent to ${user.email}`, 'success');
    };
    
    this.showConfirmModal = true;
  }

  deleteUser(user: User): void {
    this.confirmModalTitle = 'Delete User';
    this.confirmModalMessage = `Are you sure you want to permanently delete ${user.firstName} ${user.lastName}? This action cannot be undone.`;
    this.confirmModalType = 'delete';
    this.confirmButtonText = 'Delete';
    
    this.pendingAction = () => {
      const index = this.users.findIndex(u => u.id === user.id);
      if (index > -1) {
        this.users.splice(index, 1);
        
        // Remove from selected users if present
        const selectedIndex = this.selectedUsers.findIndex(u => u.id === user.id);
        if (selectedIndex > -1) {
          this.selectedUsers.splice(selectedIndex, 1);
        }
        
        this.calculateStats();
        this.filterUsers();
        this.showToast('User deleted', `${user.firstName} ${user.lastName} has been permanently deleted`, 'success');
      }
    };
    
    this.showConfirmModal = true;
  }

  // Bulk actions
  bulkVerify(): void {
    if (this.selectedUsers.length === 0) return;
    
    this.confirmModalTitle = 'Verify Users';
    this.confirmModalMessage = `Are you sure you want to verify ${this.selectedUsers.length} selected users?`;
    this.confirmModalType = 'other';
    this.confirmButtonText = 'Verify All';
    
    this.pendingAction = () => {
      this.selectedUsers.forEach(selectedUser => {
        const index = this.users.findIndex(u => u.id === selectedUser.id);
        if (index > -1) {
          this.users[index] = {
            ...this.users[index],
            isVerified: true
          };
        }
      });
      
      this.filterUsers();
      this.showToast('Users verified', `${this.selectedUsers.length} users have been verified`, 'success');
      this.selectedUsers = [];
      this.showBulkPanel = false;
    };
    
    this.showConfirmModal = true;
  }

  bulkActivate(): void {
    if (this.selectedUsers.length === 0) return;
    
    this.confirmModalTitle = 'Activate Users';
    this.confirmModalMessage = `Are you sure you want to activate ${this.selectedUsers.length} selected users?`;
    this.confirmModalType = 'activate';
    this.confirmButtonText = 'Activate All';
    
    this.pendingAction = () => {
      this.selectedUsers.forEach(selectedUser => {
        const index = this.users.findIndex(u => u.id === selectedUser.id);
        if (index > -1) {
          this.users[index] = {
            ...this.users[index],
            status: 'active'
          };
        }
      });
      
      this.calculateStats();
      this.filterUsers();
      this.showToast('Users activated', `${this.selectedUsers.length} users have been activated`, 'success');
      this.selectedUsers = [];
      this.showBulkPanel = false;
    };
    
    this.showConfirmModal = true;
  }

  bulkSuspend(): void {
    if (this.selectedUsers.length === 0) return;
    
    this.confirmModalTitle = 'Suspend Users';
    this.confirmModalMessage = `Are you sure you want to suspend ${this.selectedUsers.length} selected users? They will be unable to access the platform until reactivated.`;
    this.confirmModalType = 'suspend';
    this.confirmButtonText = 'Suspend All';
    
    this.pendingAction = () => {
      this.selectedUsers.forEach(selectedUser => {
        const index = this.users.findIndex(u => u.id === selectedUser.id);
        if (index > -1) {
          this.users[index] = {
            ...this.users[index],
            status: 'suspended'
          };
        }
      });
      
      this.calculateStats();
      this.filterUsers();
      this.showToast('Users suspended', `${this.selectedUsers.length} users have been suspended`, 'warning');
      this.selectedUsers = [];
      this.showBulkPanel = false;
    };
    
    this.showConfirmModal = true;
  }

  bulkDelete(): void {
    if (this.selectedUsers.length === 0) return;
    
    this.confirmModalTitle = 'Delete Users';
    this.confirmModalMessage = `Are you sure you want to permanently delete ${this.selectedUsers.length} selected users? This action cannot be undone.`;
    this.confirmModalType = 'delete';
    this.confirmButtonText = 'Delete All';
    
    this.pendingAction = () => {
      const userIds = this.selectedUsers.map(u => u.id);
      this.users = this.users.filter(user => !userIds.includes(user.id));
      
      this.calculateStats();
      this.filterUsers();
      this.showToast('Users deleted', `${this.selectedUsers.length} users have been permanently deleted`, 'success');
      this.selectedUsers = [];
      this.showBulkPanel = false;
    };
    
    this.showConfirmModal = true;
  }

  // Confirm modal methods
  confirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.closeConfirmModal();
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.pendingAction = null;
  }

  // Toast methods
  showToast(title: string, message: string, type: 'success' | 'warning' | 'error' | 'info'): void {
    // Clear existing toast if there is one
    if (this.toastTimer) {
      clearInterval(this.toastTimer);
      this.toastTimer = null;
    }
    
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastType = type;
    this.toastProgress = 100;
    this.isToastVisible = true;
    
    // Create timer to update progress bar
    const interval = 50; // Update every 50ms
    const duration = 5000; // Toast visible for 5 seconds
    const step = (interval / duration) * 100;
    
    this.toastTimer = setInterval(() => {
      this.toastProgress -= step;
      
      if (this.toastProgress <= 0) {
        this.closeToast();
      }
    }, interval);
  }

  closeToast(): void {
    if (this.toastTimer) {
      clearInterval(this.toastTimer);
      this.toastTimer = null;
    }
    
    this.isToastVisible = false;
  }

  // Detail view actions
  terminateSession(session: Session): void {
    this.confirmModalTitle = 'Terminate Session';
    this.confirmModalMessage = `Are you sure you want to terminate this active session? The user will be logged out from this device.`;
    this.confirmModalType = 'other';
    this.confirmButtonText = 'Terminate';
    
    this.pendingAction = () => {
      const index = this.userSessions.findIndex(s => s.id === session.id);
      if (index > -1) {
        this.userSessions[index] = {
          ...this.userSessions[index],
          active: false
        };
        
        this.showToast('Session terminated', `The user session on ${session.device} has been terminated`, 'success');
      }
    };
    
    this.showConfirmModal = true;
  }

  toggleTwoFactor(): void {
    if (!this.selectedUser) return;
    
    this.selectedUser = {
      ...this.selectedUser,
      twoFactorEnabled: !this.selectedUser.twoFactorEnabled
    };
    
    this.showToast(
      'Two-factor authentication updated', 
      `Two-factor authentication has been ${this.selectedUser.twoFactorEnabled ? 'enabled' : 'disabled'} for this user`, 
      'success'
    );
  }

  lockAccount(): void {
    if (!this.selectedUser) return;
    
    this.confirmModalTitle = 'Lock Account';
    this.confirmModalMessage = `Are you sure you want to lock this account? The user will be unable to login until the account is unlocked.`;
    this.confirmModalType = 'other';
    this.confirmButtonText = 'Lock Account';
    
    this.pendingAction = () => {
      if (this.selectedUser) {
        const index = this.users.findIndex(u => u.id === this.selectedUser!.id);
        if (index > -1) {
          this.users[index] = {
            ...this.users[index],
            status: 'inactive'
          };
          
          if (this.selectedUser) {
            this.selectedUser = {
              ...this.selectedUser,
              status: 'inactive'
            };
          }
          
          this.calculateStats();
          this.filterUsers();
          this.showToast('Account locked', `The user's account has been locked`, 'warning');
        }
      }
    };
    
    this.showConfirmModal = true;
  }

  forceLogout(): void {
    if (!this.selectedUser) return;
    
    this.confirmModalTitle = 'Force Logout';
    this.confirmModalMessage = `Are you sure you want to force logout for this user? They will be logged out from all active sessions.`;
    this.confirmModalType = 'other';
    this.confirmButtonText = 'Force Logout';
    
    this.pendingAction = () => {
      // Set all sessions to inactive
      this.userSessions = this.userSessions.map(session => ({
        ...session,
        active: false
      }));
      
      this.showToast('Force logout successful', `The user has been logged out from all active sessions`, 'success');
    };
    
    this.showConfirmModal = true;
  }

  deleteUserData(): void {
    if (!this.selectedUser) return;
    
    this.confirmModalTitle = 'Delete User Data';
    this.confirmModalMessage = `Are you sure you want to delete all data for this user? This will remove their activity, documents, and other content while keeping the account.`;
    this.confirmModalType = 'delete';
    this.confirmButtonText = 'Delete Data';
    
    this.pendingAction = () => {
      // Clear activity logs
      this.userActivityLog = [];
      
      this.showToast('User data deleted', `The user's data has been deleted while preserving the account`, 'success');
    };
    
    this.showConfirmModal = true;
  }

  // Helper methods
  generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
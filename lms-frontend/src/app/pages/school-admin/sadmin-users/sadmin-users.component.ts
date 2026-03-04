import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-sadmin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <h1 style="font-size:22px;font-weight:700">User Management 👥</h1>
        <button class="btn-primary-lms" (click)="showForm=!showForm">{{ showForm ? 'Cancel' : '+ Add User' }}</button>
      </div>

      <!-- Create/Edit User Form -->
      <div class="lms-card" style="margin-bottom:20px" *ngIf="showForm">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:16px">{{ isEdit ? 'Edit User' : 'Create New User' }}</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="lms-form-group"><label>Full Name</label><input type="text" [(ngModel)]="form.name" placeholder="Full name"/></div>
          <div class="lms-form-group"><label>Email</label><input type="email" [(ngModel)]="form.email" [disabled]="isEdit" placeholder="email@school.lms"/></div>
          <div class="lms-form-group"><label>Mobile</label><input type="text" [(ngModel)]="form.mobile" placeholder="+94 77 xxx xxxx"/></div>
          <div class="lms-form-group" *ngIf="!isEdit"><label>Password</label><input type="password" [(ngModel)]="form.password" placeholder="Minimum 8 characters"/></div>
          <div class="lms-form-group"><label>Role</label>
            <select [(ngModel)]="form.role" [disabled]="isEdit">
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ACADEMIC_MANAGER">Academic Manager</option>
              <option value="ACADEMIC_ADMIN">Academic Admin (Principal)</option>
              <option value="SCHOOL_ADMIN">School Admin</option>
            </select>
          </div>
        </div>
        <div style="margin-top:20px;display:flex;gap:10px">
          <button class="btn-primary-lms" (click)="saveUser()">{{ isEdit ? 'Update User' : 'Create User' }}</button>
          <button class="btn-outline-lms" (click)="cancel()">Cancel</button>
        </div>
        <span *ngIf="errorMsg" style="margin-left:12px;color:#DC2626;font-size:13px">{{ errorMsg }}</span>
        <span *ngIf="successMsg" style="margin-left:12px;color:#059669;font-size:13px">✅ {{ successMsg }}</span>
      </div>

      <!-- Password Reset Form -->
      <div class="lms-card" style="margin-bottom:20px" *ngIf="showResetForm">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:16px">Reset Password for {{ selectedUser?.name }}</h3>
        <div class="lms-form-group">
          <label>New Password</label>
          <input type="password" [(ngModel)]="newPassword" placeholder="Minimum 8 characters" style="max-width:300px"/>
        </div>
        <div style="margin-top:16px;display:flex;gap:10px">
          <button class="btn-primary-lms" (click)="confirmReset()">Confirm Reset</button>
          <button class="btn-outline-lms" (click)="showResetForm=false">Cancel</button>
        </div>
      </div>

      <!-- Filter -->
      <div class="lms-card" style="margin-bottom:16px;padding:16px">
        <div style="display:flex;align-items:center;gap:12px">
          <select [(ngModel)]="filterRole" (ngModelChange)="loadUsers()" style="padding:8px 12px;border:1px solid #E5E7F0;border-radius:8px;font-size:14px">
            <option value="">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Teachers Only</option>
            <option value="ACADEMIC_MANAGER">Managers</option>
            <option value="ACADEMIC_ADMIN">Academic Admins</option>
            <option value="SCHOOL_ADMIN">School Admins</option>
          </select>
          <span style="color:#64748B;font-size:13px">{{ users.length }} user(s) found</span>
        </div>
      </div>

      <!-- User Table -->
      <div class="lms-card">
        <table class="lms-table" *ngIf="users.length > 0; else empty">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td><span class="badge-lms blue">{{ u.role?.replace('_',' ') }}</span></td>
              <td><span class="badge-lms" [class.green]="u.isActive" [class.red]="!u.isActive">{{ u.isActive ? 'Active' : 'Inactive' }}</span></td>
              <td>
                <button (click)="editUser(u)" class="btn-outline-lms" style="padding:4px 10px;font-size:12px;margin-right:6px">Edit</button>
                <button (click)="resetPassword(u)" class="btn-outline-lms" style="padding:4px 10px;font-size:12px;margin-right:6px">Reset Pwd</button>
                <button (click)="toggleActive(u)" class="btn-outline-lms" style="padding:4px 10px;font-size:12px;margin-right:6px">
                  {{ u.isActive ? 'Deactivate' : 'Activate' }}
                </button>
                <button (click)="deleteUser(u)" class="btn-outline-lms" style="padding:4px 10px;font-size:12px;color:#DC2626;border-color:#FCA5A5">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <ng-template #empty><div style="text-align:center;padding:40px;color:#64748B"><div style="font-size:40px;margin-bottom:12px">👥</div><p>No users found.</p></div></ng-template>
      </div>
    </div>
  `
})
export class SadminUsersComponent implements OnInit {
  users: any[] = [];
  filterRole = '';
  showForm = false;
  isEdit = false;
  showResetForm = false;
  selectedUser: any = null;
  newPassword = '';

  form = { id: undefined as number | undefined, name: '', email: '', mobile: '', password: '', role: 'STUDENT' };
  successMsg = '';
  errorMsg = '';

  constructor(private api: ApiService) { }

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    const params: Record<string, string> = {};
    if (this.filterRole) params['role'] = this.filterRole;
    this.api.get<any[]>('users', params).subscribe({ next: u => this.users = u, error: () => { } });
  }

  editUser(u: any): void {
    this.isEdit = true;
    this.showForm = true;
    this.selectedUser = u;
    this.form = { ...u, password: '' };
  }

  cancel(): void {
    this.showForm = false;
    this.isEdit = false;
    this.form = { id: undefined, name: '', email: '', mobile: '', password: '', role: 'STUDENT' };
  }

  saveUser(): void {
    if (!this.form.name || !this.form.email || (!this.isEdit && !this.form.password)) {
      this.errorMsg = 'Required fields missing.'; return;
    }
    this.errorMsg = '';

    if (this.isEdit) {
      this.api.put<any>(`users/${this.form.id}`, this.form).subscribe({
        next: u => {
          const idx = this.users.findIndex(x => x.id === u.id);
          if (idx >= 0) this.users[idx] = u;
          this.successMsg = `User updated!`;
          this.cancel();
          setTimeout(() => this.successMsg = '', 3000);
        },
        error: err => { this.errorMsg = err.error?.message || 'Failed to update user.'; }
      });
    } else {
      this.api.post<any>('users', this.form).subscribe({
        next: u => {
          this.users.unshift(u);
          this.successMsg = `User "${u.name}" created!`;
          this.cancel();
          setTimeout(() => this.successMsg = '', 3000);
        },
        error: err => { this.errorMsg = err.error?.message || 'Failed to create user.'; }
      });
    }
  }

  resetPassword(user: any): void {
    this.selectedUser = user;
    this.showResetForm = true;
    this.newPassword = '';
  }

  confirmReset(): void {
    if (!this.newPassword) return;
    this.api.post<any>(`users/${this.selectedUser.id}/reset-password`, { newPassword: this.newPassword }).subscribe({
      next: () => {
        this.successMsg = `Password reset for ${this.selectedUser.name}`;
        this.showResetForm = false;
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => { this.errorMsg = 'Failed to reset password.'; }
    });
  }

  toggleActive(user: any): void {
    this.api.put<any>(`users/${user.id}`, { ...user, isActive: !user.isActive }).subscribe({
      next: u => { const idx = this.users.findIndex(x => x.id === u.id); if (idx >= 0) this.users[idx] = u; },
      error: () => { }
    });
  }

  deleteUser(user: any): void {
    if (!confirm(`Are you sure you want to PERMANENTLY delete ${user.name}?`)) return;
    this.api.delete(`users/${user.id}`).subscribe({
      next: () => {
        this.users = this.users.filter(x => x.id !== user.id);
        this.successMsg = `User "${user.name}" deleted.`;
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => { this.errorMsg = 'Failed to delete user.'; }
    });
  }
}

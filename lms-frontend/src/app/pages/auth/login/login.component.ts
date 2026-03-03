import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-logo">
          <div class="logo-box">A</div>
          <span class="login-brand">AxsyntheGroup</span>
        </div>
        <p class="login-subtitle">School Learning Management System</p>
        <h2>Welcome Back</h2>
        <p style="text-align:center;color:#64748B;font-size:13px;margin-bottom:28px;">Sign in to continue to your dashboard</p>

        <div *ngIf="error" class="alert-lms-error">{{ error }}</div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="lms-form-group">
            <label for="email">Email Address</label>
            <input id="email" type="email" name="email" [(ngModel)]="email"
                   placeholder="you@school.lms" required autocomplete="email"/>
          </div>

          <div class="lms-form-group">
            <label for="password">Password</label>
            <div style="position:relative">
              <input id="password" [type]="showPass ? 'text' : 'password'" name="password"
                     [(ngModel)]="password" placeholder="••••••••" required autocomplete="current-password"/>
              <button type="button" (click)="showPass=!showPass"
                      style="position:absolute;right:12px;top:50%;transform:translateY(-50%);
                             background:none;border:none;cursor:pointer;color:#64748B;font-size:13px">
                {{ showPass ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>

          <button type="submit" class="btn-primary-lms" style="width:100%;padding:12px;font-size:15px;margin-top:8px"
                  [disabled]="loading">
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading">Signing in…</span>
          </button>
        </form>

        <div class="seed-hint">
          <p>🔑 <strong>Default accounts (all password: Admin@123)</strong></p>
          <ul>
            <li>superadmin&#64;lms.local</li>
            <li>schooladmin&#64;lms.local</li>
            <li>principal&#64;lms.local</li>
            <li>teacher&#64;lms.local</li>
            <li>student&#64;lms.local</li>
          </ul>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .alert-lms-error {
      background: #FEF2F2; border: 1px solid #FCA5A5; color: #DC2626;
      border-radius: 8px; padding: 10px 14px; font-size: 13px;
      margin-bottom: 16px;
    }
    .seed-hint {
      margin-top: 28px; padding: 14px 16px;
      background: #F8FAFC; border: 1px solid #E5E7F0; border-radius: 10px;
      font-size: 12px; color: #64748B;
      p { font-weight: 600; margin-bottom: 6px; }
      ul { padding-left: 18px; line-height: 1.8; }
    }
  `]
})
export class LoginComponent {
    email = '';
    password = '';
    loading = false;
    error = '';
    showPass = false;

    constructor(private auth: AuthService, private router: Router) { }

    onLogin(): void {
        if (!this.email || !this.password) return;
        this.loading = true;
        this.error = '';

        this.auth.login(this.email, this.password).subscribe({
            next: (res) => {
                this.loading = false;
                this.navigateByRole(res.role);
            },
            error: (err) => {
                this.loading = false;
                this.error = err.error?.message || 'Invalid email or password.';
            }
        });
    }

    private navigateByRole(role: string): void {
        const map: Record<string, string> = {
            SUPER_ADMIN: '/school-admin/dashboard',
            SCHOOL_ADMIN: '/school-admin/dashboard',
            ACADEMIC_ADMIN: '/academic-admin/dashboard',
            ACADEMIC_MANAGER: '/manager/dashboard',
            TEACHER: '/teacher/dashboard',
            STUDENT: '/student/dashboard',
        };
        this.router.navigate([map[role] || '/dashboard']);
    }
}

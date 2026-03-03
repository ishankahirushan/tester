import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="lms-layout">
      <!-- Sidebar -->
      <aside class="lms-sidebar" [class.open]="sidebarOpen">
        <div class="sidebar-brand">
          <div class="brand-logo">
            <div class="logo-icon">A</div>
            <div class="brand-name">
              AxsyntheGroup<br>
              <span class="brand-sub">School LMS</span>
            </div>
          </div>
        </div>

        <nav>
          <div class="nav-section">Main</div>
          <a [routerLink]="dashboardLink" routerLinkActive="active">
            <span class="nav-icon">🏠</span> Dashboard
          </a>

          <!-- Student Links -->
          <ng-container *ngIf="role === 'STUDENT'">
            <div class="nav-section">Learning</div>
            <a routerLink="/student/subjects" routerLinkActive="active"><span class="nav-icon">📚</span> Subjects</a>
            <a routerLink="/student/tasks" routerLinkActive="active"><span class="nav-icon">📝</span> Tasks</a>
            <a routerLink="/student/marks" routerLinkActive="active"><span class="nav-icon">📊</span> Marks & GPA</a>
            <a routerLink="/student/attendance" routerLinkActive="active"><span class="nav-icon">📅</span> Attendance</a>
          </ng-container>

          <!-- Teacher Links -->
          <ng-container *ngIf="role === 'TEACHER'">
            <div class="nav-section">Teaching</div>
            <a routerLink="/teacher/tasks" routerLinkActive="active"><span class="nav-icon">📝</span> Tasks</a>
            <a routerLink="/teacher/marks" routerLinkActive="active"><span class="nav-icon">✏️</span> Enter Marks</a>
            <a routerLink="/teacher/attendance" routerLinkActive="active"><span class="nav-icon">📅</span> Attendance</a>
          </ng-container>

          <!-- Academic Manager Links -->
          <ng-container *ngIf="role === 'ACADEMIC_MANAGER'">
            <div class="nav-section">Management</div>
            <a routerLink="/manager/dashboard" routerLinkActive="active"><span class="nav-icon">📊</span> Section Stats</a>
          </ng-container>

          <!-- Academic Admin Links -->
          <ng-container *ngIf="role === 'ACADEMIC_ADMIN'">
            <div class="nav-section">Administration</div>
            <a routerLink="/academic-admin/dashboard" routerLinkActive="active"><span class="nav-icon">🏫</span> School Overview</a>
          </ng-container>

          <!-- School Admin Links -->
          <ng-container *ngIf="role === 'SCHOOL_ADMIN' || role === 'SUPER_ADMIN'">
            <div class="nav-section">Administration</div>
            <a routerLink="/school-admin/users" routerLinkActive="active"><span class="nav-icon">👥</span> Users</a>
            <a routerLink="/school-admin/classes" routerLinkActive="active"><span class="nav-icon">🏫</span> Classes & Subjects</a>
            <a routerLink="/school-admin/activity-logs" routerLinkActive="active"><span class="nav-icon">📋</span> Activity Logs</a>
            <a routerLink="/school-admin/notifications" routerLinkActive="active"><span class="nav-icon">📣</span> Post Announcements</a>
            <a routerLink="/school-admin/settings" routerLinkActive="active"><span class="nav-icon">⚙️</span> System Settings</a>
          </ng-container>
        </nav>

        <div class="sidebar-footer">
          <span>{{ user?.name }}</span><br>
          <small>{{ roleName }}</small>
        </div>
      </aside>

      <!-- Header -->
      <header class="lms-header">
        <div style="display:flex;align-items:center;gap:12px">
          <button (click)="sidebarOpen=!sidebarOpen"
                  style="display:none;background:none;border:none;cursor:pointer;font-size:20px"
                  class="menu-toggle">☰</button>
          <span class="header-title">{{ pageTitle }}</span>
        </div>
        <div class="header-actions">
          <!-- Notification Bell -->
          <div class="notif-bell" (click)="showNotifs = !showNotifs" style="position:relative;cursor:pointer;margin-right:16px">
             <span style="font-size:20px">🔔</span>
             <span class="badge" *ngIf="unreadCount > 0" 
                   style="position:absolute;top:-5px;right:-8px;background:#EF4444;color:white;font-size:10px;padding:2px 5px;border-radius:10px;font-weight:700">
               {{ unreadCount }}
             </span>
             <div class="notif-dropdown" *ngIf="showNotifs" 
                  style="position:absolute;top:35px;right:0;width:280px;background:white;border:1px solid #E5E7F0;border-radius:10px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);z-index:100;padding:12px">
                <div style="font-weight:700;font-size:13px;border-bottom:1px solid #F1F5F9;padding-bottom:8px;margin-bottom:8px">Notifications</div>
                <div *ngFor="let n of notifications" style="padding:8px 0;border-bottom:1px solid #F8FAFC">
                   <div style="font-weight:600;font-size:12px">{{ n.title }}</div>
                   <div style="font-size:11px;color:#64748B">{{ n.message }}</div>
                </div>
                <div *ngIf="notifications.length === 0" style="padding:10px;text-align:center;font-size:12px;color:#94A3B8">No new notifications</div>
             </div>
          </div>

          <div class="avatar-btn" [title]="user?.name || ''">{{ initials }}</div>
          <button class="logout-btn" (click)="logout()">Sign Out</button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="lms-main fade-in">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class LayoutComponent implements OnInit {
  sidebarOpen = false;
  showNotifs = false;
  pageTitle = 'Dashboard';
  notifications: any[] = [];
  unreadCount = 0;

  constructor(
    public auth: AuthService,
    private router: Router,
    private notif: NotificationService
  ) { }

  get user() { return this.auth.getUser(); }
  get role() { return this.auth.getRole(); }

  get dashboardLink(): string {
    const map: Record<string, string> = {
      SUPER_ADMIN: '/school-admin/dashboard',
      SCHOOL_ADMIN: '/school-admin/dashboard',
      ACADEMIC_ADMIN: '/academic-admin/dashboard',
      ACADEMIC_MANAGER: '/manager/dashboard',
      TEACHER: '/teacher/dashboard',
      STUDENT: '/student/dashboard',
    };
    return map[this.role || ''] || '/dashboard';
  }

  get initials(): string {
    return this.user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';
  }

  get roleName(): string {
    return this.role?.replace(/_/g, ' ') ?? '';
  }

  ngOnInit(): void {
    this.notif.notifications$.subscribe(n => {
      this.notifications = n;
      this.unreadCount = n.length;
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      const url = this.router.url;
      if (url.includes('dashboard')) this.pageTitle = 'Dashboard';
      else if (url.includes('users')) this.pageTitle = 'User Management';
      else if (url.includes('classes')) this.pageTitle = 'Class & Subject Management';
      else if (url.includes('marks')) this.pageTitle = 'Marks & GPA';
      else if (url.includes('attendance')) this.pageTitle = 'Attendance';
      else if (url.includes('tasks')) this.pageTitle = 'Tasks';
      else if (url.includes('subjects')) this.pageTitle = 'Subjects';
      else if (url.includes('activity-logs')) this.pageTitle = 'Activity Logs';
      else if (url.includes('notifications')) this.pageTitle = 'Post Announcements';
      else if (url.includes('settings')) this.pageTitle = 'System Settings';
    });
  }

  logout(): void { this.auth.logout(); }
}

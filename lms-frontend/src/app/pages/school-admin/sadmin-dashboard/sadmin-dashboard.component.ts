import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-sadmin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="fade-in">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.5px">School Administration 🛠️</h1>
        <div style="display:flex;align-items:center;gap:12px">
           <button (click)="loadAll()" class="btn-outline-lms" style="padding:6px 12px;font-size:12px">🔄 Refresh</button>
           <span style="font-size:13px;color:#64748B;font-weight:500">{{ today | date:'fullDate' }}</span>
        </div>
      </div>

      <!-- Stat Grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:28px">
        <div class="stat-card"><div class="stat-icon blue">👥</div><div class="stat-content"><div class="stat-value">{{ totalUsers }}</div><div class="stat-label">Users Registered</div></div></div>
        <div class="stat-card"><div class="stat-icon green">🎓</div><div class="stat-content"><div class="stat-value">{{ students }}</div><div class="stat-label">Active Students</div></div></div>
        <div class="stat-card"><div class="stat-icon purple">👩‍🏫</div><div class="stat-content"><div class="stat-value">{{ teachers }}</div><div class="stat-label">Teaching Staff</div></div></div>
        <div class="stat-card"><div class="stat-icon amber">🏫</div><div class="stat-content"><div class="stat-value">{{ totalClasses }}</div><div class="stat-label">Total Classes</div></div></div>
        <div class="stat-card"><div class="stat-icon indigo">📚</div><div class="stat-content"><div class="stat-value">{{ totalSubjects }}</div><div class="stat-label">Active Subjects</div></div></div>
        <div class="stat-card" style="background:#F0FDF4;border-color:#BBF7D0">
          <div class="stat-icon green">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ attendanceStats.present || 0 }}</div>
            <div class="stat-label">Present Today</div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1.2fr 1.8fr;gap:24px">
        <!-- Quick Actions -->
        <div>
           <h3 style="font-size:16px;font-weight:700;margin-bottom:16px">Quick Management</h3>
           <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <a routerLink="/school-admin/users" class="action-card">
                <div style="font-size:24px;margin-bottom:8px">👥</div>
                <div style="font-weight:600;font-size:14px">User Directory</div>
              </a>
              <a routerLink="/school-admin/classes" class="action-card">
                <div style="font-size:24px;margin-bottom:8px">🏫</div>
                <div style="font-weight:600;font-size:14px">Classes & Subs</div>
              </a>
              <a routerLink="/school-admin/notifications" class="action-card">
                <div style="font-size:24px;margin-bottom:8px">📣</div>
                <div style="font-weight:600;font-size:14px">Announcements</div>
              </a>
              <a routerLink="/school-admin/settings" class="action-card">
                <div style="font-size:24px;margin-bottom:8px">⚙️</div>
                <div style="font-weight:600;font-size:14px">System Settings</div>
              </a>
              <a routerLink="/school-admin/activity-logs" class="action-card" style="grid-column: span 2">
                <div style="font-size:24px;margin-bottom:8px">📋</div>
                <div style="font-weight:600;font-size:14px">Full System Audit Logs</div>
              </a>
           </div>
        </div>

        <!-- Activity Feed -->
        <div class="lms-card">
           <h3 style="font-size:16px;font-weight:700;margin-bottom:16px">Recent System Activity</h3>
           <div *ngFor="let log of recentLogs" style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #F1F5F9">
              <div style="width:36px;height:36px;border-radius:50%;background:#F1F5F9;display:flex;align-items:center;justify-content:center;font-size:14px">
                 {{ log.action.substring(0,2) }}
              </div>
              <div style="flex:1">
                 <div style="font-weight:600;font-size:13px">{{ log.context }}</div>
                 <div style="display:flex;justify-content:space-between;font-size:11px;color:#94A3B8;margin-top:2px">
                    <span>By {{ log.userName }}</span>
                    <span>{{ log.createdAt | date:'shortTime' }}</span>
                 </div>
              </div>
           </div>
           <p *ngIf="recentLogs.length === 0" style="padding:24px;text-align:center;color:#94A3B8;font-size:13px">No recent logs recorded.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .action-card { 
      background:white; border:1px solid #E5E7F0; border-radius:12px; padding:16px; text-decoration:none; text-align:center; 
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor:pointer; 
    }
    .action-card:hover { border-color:#5B6EF5; transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); background:#F5F6FA; }
  `]
})
export class SadminDashboardComponent implements OnInit {
  totalUsers = 0; students = 0; teachers = 0;
  totalClasses = 0; totalSubjects = 0;
  attendanceStats: any = {};
  recentLogs: any[] = [];
  today = new Date();

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    forkJoin({
      users: this.api.get<any[]>('users'),
      classes: this.api.get<any[]>('classes'),
      subjects: this.api.get<any[]>('subjects'),
      attendance: this.api.get<any>('attendance/stats'),
      logs: this.api.get<any>('activity-logs', { page: '0', size: '6' })
    }).subscribe({
      next: res => {
        this.totalUsers = res.users.length;
        this.students = res.users.filter(u => u.role === 'STUDENT').length;
        this.teachers = res.users.filter(u => u.role === 'TEACHER').length;
        this.totalClasses = res.classes.length;
        this.totalSubjects = res.subjects.length;
        this.attendanceStats = res.attendance || {};
        this.recentLogs = res.logs.content || [];
      },
      error: () => { }
    });
  }
}

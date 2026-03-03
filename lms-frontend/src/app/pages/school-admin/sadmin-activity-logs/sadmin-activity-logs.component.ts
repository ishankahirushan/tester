import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-sadmin-activity-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fade-in">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:8px">Activity Logs 📋</h1>
      <p style="color:#64748B;font-size:13px;margin-bottom:20px">All user actions are recorded here. This log is view-only and cannot be edited or deleted.</p>

      <div class="lms-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <h3 style="font-size:15px;font-weight:600">System Activity ({{ totalElements }} records)</h3>
          <span style="font-size:12px;color:#64748B;background:#F3F4F6;padding:4px 12px;border-radius:100px">🔒 Read Only</span>
        </div>
        <table class="lms-table" *ngIf="logs.length > 0; else empty">
          <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Context</th></tr></thead>
          <tbody>
            <tr *ngFor="let log of logs">
              <td style="white-space:nowrap;font-size:12px">{{ log.createdAt | date:'dd MMM yy, HH:mm' }}</td>
              <td>{{ log.userName }}</td>
              <td><span class="badge-lms blue">{{ log.action }}</span></td>
              <td style="color:#64748B;font-size:13px">{{ log.context }}</td>
            </tr>
          </tbody>
        </table>
        <ng-template #empty>
          <div style="text-align:center;padding:40px;color:#64748B">
            <div style="font-size:40px;margin-bottom:12px">📋</div>
            <p>No activity logs found yet.</p>
          </div>
        </ng-template>
        <div style="margin-top:14px;display:flex;gap:10px">
          <button class="btn-outline-lms" (click)="prevPage()" [disabled]="page === 0" style="padding:7px 18px">← Previous</button>
          <span style="display:flex;align-items:center;font-size:13px;color:#64748B">Page {{ page + 1 }}</span>
          <button class="btn-outline-lms" (click)="nextPage()" style="padding:7px 18px">Next →</button>
        </div>
      </div>
    </div>
  `
})
export class SadminActivityLogsComponent implements OnInit {
  logs: any[] = [];
  page = 0;
  pageSize = 25;
  totalElements = 0;

  constructor(private api: ApiService) { }

  ngOnInit(): void { this.loadLogs(); }

  loadLogs(): void {
    this.api.get<any>('activity-logs', { page: String(this.page), size: String(this.pageSize) }).subscribe({
      next: res => {
        this.logs = res.content || [];
        this.totalElements = res.totalElements || 0;
      },
      error: () => { }
    });
  }

  nextPage(): void {
    if ((this.page + 1) * this.pageSize < this.totalElements) {
      this.page++;
      this.loadLogs();
    }
  }
  prevPage(): void { if (this.page > 0) { this.page--; this.loadLogs(); } }
}

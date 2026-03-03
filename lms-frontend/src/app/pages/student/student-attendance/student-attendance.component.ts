import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-student-attendance',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fade-in">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:20px">My Attendance</h1>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px">
        <div class="stat-card"><div class="stat-icon green">✅</div><div class="stat-content"><div class="stat-value">{{summary.present}}</div><div class="stat-label">Present</div></div></div>
        <div class="stat-card"><div class="stat-icon red">❌</div><div class="stat-content"><div class="stat-value">{{summary.absent}}</div><div class="stat-label">Absent</div></div></div>
        <div class="stat-card"><div class="stat-icon amber">⏰</div><div class="stat-content"><div class="stat-value">{{summary.late}}</div><div class="stat-label">Late</div></div></div>
        <div class="stat-card"><div class="stat-icon blue">📅</div><div class="stat-content"><div class="stat-value">{{attendanceRate}}%</div><div class="stat-label">Attendance Rate</div></div></div>
      </div>
      <div class="lms-card">
        <h3 style="font-size:16px;font-weight:600;margin-bottom:16px">Attendance Records</h3>
        <table class="lms-table" *ngIf="records.length > 0; else empty">
          <thead><tr><th>Date</th><th>Status</th><th>Recorded By</th></tr></thead>
          <tbody>
            <tr *ngFor="let r of records">
              <td>{{ r.date | date:'dd MMM yyyy' }}</td>
              <td>
                <span class="badge-lms" [class.green]="r.status==='PRESENT'" [class.red]="r.status==='ABSENT'" [class.amber]="r.status==='LATE'">
                  {{ r.status }}
                </span>
              </td>
              <td>{{ r.recordedBy?.name || 'N/A' }}</td>
            </tr>
          </tbody>
        </table>
        <ng-template #empty><p style="color:#64748B;padding:20px 0">No attendance records found.</p></ng-template>
      </div>
    </div>
  `
})
export class StudentAttendanceComponent implements OnInit {
    records: any[] = [];
    summary: any = { present: 0, absent: 0, late: 0, total: 0 };

    constructor(private api: ApiService, private auth: AuthService) { }

    get attendanceRate(): string {
        const t = this.summary.total;
        return t > 0 ? Math.round((this.summary.present / t) * 100).toString() : '0';
    }

    ngOnInit(): void {
        const uid = this.auth.getUser()?.userId;
        if (!uid) return;
        this.api.get<any[]>(`attendance/student/${uid}`).subscribe({ next: r => this.records = r, error: () => { } });
        this.api.get<any>(`attendance/student/${uid}/summary`).subscribe({ next: s => this.summary = s, error: () => { } });
    }
}

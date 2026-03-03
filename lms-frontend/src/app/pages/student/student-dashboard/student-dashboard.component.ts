import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-student-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="fade-in">
      <div style="margin-bottom:24px">
        <h1 style="font-size:22px;font-weight:700">Welcome back, {{ user?.name }}! 👋</h1>
        <p style="color:#64748B;font-size:13px;margin-top:4px">Here's your learning summary</p>
      </div>

      <!-- Stats -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:28px">
        <div class="stat-card">
          <div class="stat-icon blue">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ gpa }}</div>
            <div class="stat-label">Current GPA</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{attendanceSummary.present}}</div>
            <div class="stat-label">Days Present</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red">❌</div>
          <div class="stat-content">
            <div class="stat-value">{{attendanceSummary.absent}}</div>
            <div class="stat-label">Days Absent</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon amber">📝</div>
          <div class="stat-content">
            <div class="stat-value">{{ marks.length }}</div>
            <div class="stat-label">Graded Tasks</div>
          </div>
        </div>
      </div>

      <!-- Recent Marks -->
      <div class="lms-card" style="margin-bottom:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
          <h3 style="font-size:16px;font-weight:600">Recent Marks</h3>
          <a routerLink="/student/marks" style="color:#5B6EF5;font-size:13px;font-weight:500;text-decoration:none">View all →</a>
        </div>
        <table class="lms-table" *ngIf="marks.length > 0; else noMarks">
          <thead>
            <tr>
              <th>Task</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>GPA</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of marks.slice(0,5)">
              <td>{{ m.taskTitle }}</td>
              <td>{{ m.marksObtained }}/{{ m.maxMarks }}</td>
              <td>{{ m.percentageScore }}%</td>
              <td>{{ m.gpa }}</td>
              <td>
                <span class="badge-lms" [class.green]="m.marksObtained >= 40" [class.red]="m.marksObtained < 40">
                  {{ m.marksObtained >= 40 ? 'Pass' : 'Fail' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <ng-template #noMarks><p style="color:#64748B;font-size:13px;padding:12px 0">No marks recorded yet.</p></ng-template>
      </div>

      <!-- Quick Links -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px">
        <a routerLink="/student/subjects" class="lms-card" style="text-decoration:none;text-align:center;cursor:pointer">
          <div style="font-size:28px;margin-bottom:8px">📚</div>
          <div style="font-weight:600;font-size:14px">My Subjects</div>
        </a>
        <a routerLink="/student/tasks" class="lms-card" style="text-decoration:none;text-align:center;cursor:pointer">
          <div style="font-size:28px;margin-bottom:8px">📝</div>
          <div style="font-weight:600;font-size:14px">My Tasks</div>
        </a>
        <a routerLink="/student/attendance" class="lms-card" style="text-decoration:none;text-align:center;cursor:pointer">
          <div style="font-size:28px;margin-bottom:8px">📅</div>
          <div style="font-weight:600;font-size:14px">Attendance</div>
        </a>
      </div>
    </div>
  `
})
export class StudentDashboardComponent implements OnInit {
    marks: any[] = [];
    attendanceSummary: any = { present: 0, absent: 0, total: 0 };
    gpa = '0.00';

    constructor(private api: ApiService, public auth: AuthService) { }

    get user() { return this.auth.getUser(); }

    ngOnInit(): void {
        const uid = this.user?.userId;
        if (!uid) return;

        this.api.get<any[]>(`marks/student/${uid}`).subscribe({
            next: marks => {
                this.marks = marks;
                if (marks.length > 0) {
                    const avgGpa = marks.reduce((sum, m) => sum + (m.gpa || 0), 0) / marks.length;
                    this.gpa = avgGpa.toFixed(2);
                }
            }, error: () => { }
        });

        this.api.get<any>(`attendance/student/${uid}/summary`).subscribe({
            next: s => this.attendanceSummary = s,
            error: () => { }
        });
    }
}

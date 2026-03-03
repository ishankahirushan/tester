import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-teacher-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="fade-in">
      <div style="margin-bottom:24px">
        <h1 style="font-size:22px;font-weight:700">Teacher Dashboard 👩‍🏫</h1>
        <p style="color:#64748B;font-size:13px;margin-top:4px">Welcome, {{ user?.name }}</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:28px">
        <div class="stat-card"><div class="stat-icon blue">📚</div><div class="stat-content"><div class="stat-value">{{ subjects.length }}</div><div class="stat-label">My Subjects</div></div></div>
        <div class="stat-card"><div class="stat-icon amber">📝</div><div class="stat-content"><div class="stat-value">{{ tasks.length }}</div><div class="stat-label">Total Tasks</div></div></div>
      </div>

      <!-- My Subjects -->
      <div class="lms-card" style="margin-bottom:20px">
        <h3 style="font-size:16px;font-weight:600;margin-bottom:16px">My Subjects</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
          <div *ngFor="let s of subjects" style="padding:14px;background:#F5F6FA;border-radius:8px">
            <div style="font-weight:600;font-size:14px">{{ s.name }}</div>
            <div style="color:#64748B;font-size:12px;margin-top:4px">{{ s.schoolClass?.name }}</div>
          </div>
          <div *ngIf="subjects.length===0" style="color:#64748B;font-size:13px">No subjects assigned yet.</div>
        </div>
      </div>

      <!-- Tasks Overview -->
      <div class="lms-card">
        <h3 style="font-size:16px;font-weight:600;margin-bottom:16px">Recent Tasks</h3>
        <table class="lms-table" *ngIf="tasks.length > 0; else noTasks">
          <thead><tr><th>Title</th><th>Subject</th><th>Type</th><th>Deadline</th></tr></thead>
          <tbody>
            <tr *ngFor="let t of tasks.slice(0, 8)">
              <td>{{ t.title }}</td>
              <td>{{ t.subject?.name }}</td>
              <td><span class="badge-lms blue">{{ t.type }}</span></td>
              <td>{{ t.deadline ? (t.deadline | date:'dd MMM yyyy') : '—' }}</td>
            </tr>
          </tbody>
        </table>
        <ng-template #noTasks><p style="color:#64748B;padding:12px 0">No tasks created yet.</p></ng-template>
      </div>
    </div>
  `
})
export class TeacherDashboardComponent implements OnInit {
    subjects: any[] = [];
    tasks: any[] = [];

    constructor(private api: ApiService, public auth: AuthService) { }
    get user() { return this.auth.getUser(); }

    ngOnInit(): void {
        const uid = this.user?.userId;
        if (!uid) return;
        this.api.get<any[]>('subjects', { teacherId: String(uid) }).subscribe({
            next: s => {
                this.subjects = s;
                s.forEach(sub => {
                    this.api.get<any[]>(`subjects/${sub.id}/tasks`).subscribe({
                        next: t => this.tasks = [...this.tasks, ...t], error: () => { }
                    });
                });
            }, error: () => { }
        });
    }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fade-in">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:20px">School Overview 🏫</h1>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
        <div class="stat-card"><div class="stat-icon blue">👩‍🏫</div><div class="stat-content"><div class="stat-value">{{ teachers.length }}</div><div class="stat-label">Total Teachers</div></div></div>
        <div class="stat-card"><div class="stat-icon green">🎓</div><div class="stat-content"><div class="stat-value">{{ students.length }}</div><div class="stat-label">Total Students</div></div></div>
        <div class="stat-card"><div class="stat-icon amber">📚</div><div class="stat-content"><div class="stat-value">{{ subjects.length }}</div><div class="stat-label">Subjects</div></div></div>
      </div>
      <div class="lms-card">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:14px">Teacher Performance</h3>
        <p style="color:#64748B;font-size:13px">Performance analytics are computed from mark submissions. Select a teacher to drill down.</p>
        <table class="lms-table" style="margin-top:14px" *ngIf="teachers.length > 0; else empty">
          <thead><tr><th>Name</th><th>Email</th><th>Mobile</th></tr></thead>
          <tbody>
            <tr *ngFor="let t of teachers">
              <td>{{ t.name }}</td><td>{{ t.email }}</td><td>{{ t.mobile || '—' }}</td>
            </tr>
          </tbody>
        </table>
        <ng-template #empty><p style="color:#64748B;padding:12px 0">No teachers found.</p></ng-template>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
    teachers: any[] = [];
    students: any[] = [];
    subjects: any[] = [];
    constructor(private api: ApiService) { }
    ngOnInit(): void {
        this.api.get<any[]>('users', { role: 'TEACHER' }).subscribe({ next: t => this.teachers = t, error: () => { } });
        this.api.get<any[]>('users', { role: 'STUDENT' }).subscribe({ next: s => this.students = s, error: () => { } });
        this.api.get<any[]>('subjects').subscribe({ next: s => this.subjects = s, error: () => { } });
    }
}

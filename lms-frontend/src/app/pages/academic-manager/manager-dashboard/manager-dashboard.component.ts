import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fade-in">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:20px">Section Overview 📊</h1>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
        <div class="stat-card"><div class="stat-icon blue">👩‍🏫</div><div class="stat-content"><div class="stat-value">{{ teachers.length }}</div><div class="stat-label">Teachers in Section</div></div></div>
        <div class="stat-card"><div class="stat-icon green">🎓</div><div class="stat-content"><div class="stat-value">{{ students.length }}</div><div class="stat-label">Students in Section</div></div></div>
      </div>
      <div class="lms-card">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:14px">Teachers in My Section</h3>
        <table class="lms-table" *ngIf="teachers.length > 0; else empty">
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
export class ManagerDashboardComponent implements OnInit {
  classes: any[] = [];
  teachers: any[] = [];
  students: any[] = [];

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    const uid = JSON.parse(localStorage.getItem('lms_user') || '{}').userId;
    if (!uid) return;

    // 1. Get classes managed by this manager
    this.api.get<any[]>('classes', { managerId: String(uid) }).subscribe({
      next: cls => {
        this.classes = cls;

        // 2. Get teachers for these classes (via subjects)
        cls.forEach(c => {
          this.api.get<any[]>('subjects', { classId: String(c.id) }).subscribe({
            next: subjects => {
              subjects.forEach(s => {
                s.teachers?.forEach((t: any) => {
                  if (!this.teachers.find(x => x.id === t.id)) this.teachers.push(t);
                });
              });
            }
          });

          // 3. Increment student count (or fetch students)
          this.api.get<any[]>(`users/class/${c.id}`).subscribe({
            next: st => {
              st.forEach(s => {
                if (!this.students.find(x => x.id === s.id)) this.students.push(s);
              });
            }
          });
        });
      },
      error: () => { }
    });
  }
}

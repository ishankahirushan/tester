import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-student-tasks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fade-in">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:20px">My Tasks</h1>
      <div class="lms-card">
        <table class="lms-table" *ngIf="tasks.length > 0; else empty">
          <thead><tr><th>Title</th><th>Subject</th><th>Type</th><th>Deadline</th><th>Max Marks</th></tr></thead>
          <tbody>
            <tr *ngFor="let t of tasks">
              <td><strong>{{ t.title }}</strong></td>
              <td>{{ t.subject?.name }}</td>
              <td><span class="badge-lms blue">{{ t.type }}</span></td>
              <td>{{ t.deadline ? (t.deadline | date:'dd MMM yyyy') : 'No deadline' }}</td>
              <td>{{ t.maxMarks }}</td>
            </tr>
          </tbody>
        </table>
        <ng-template #empty>
          <div style="text-align:center;padding:40px;color:#64748B">
            <div style="font-size:40px;margin-bottom:12px">📝</div>
            <p>No tasks assigned yet.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class StudentTasksComponent implements OnInit {
  tasks: any[] = [];
  constructor(private api: ApiService) { }
  ngOnInit(): void {
    const uid = JSON.parse(localStorage.getItem('lms_user') || '{}').userId;
    if (!uid) return;

    this.api.get<any[]>('subjects', { studentId: String(uid) }).subscribe({
      next: subjects => {
        this.tasks = [];
        subjects.forEach(s => {
          this.api.get<any[]>(`subjects/${s.id}/tasks`).subscribe({
            next: t => this.tasks = [...this.tasks, ...t],
            error: () => { }
          });
        });
      }, error: () => { }
    });
  }
}

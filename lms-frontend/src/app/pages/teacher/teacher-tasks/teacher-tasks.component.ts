import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-teacher-tasks',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="fade-in">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:20px">Manage Tasks 📝</h1>

      <!-- Create Task -->
      <div class="lms-card" style="margin-bottom:20px">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:16px">Create New Task</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="lms-form-group"><label>Subject</label>
            <select [(ngModel)]="form.subjectId">
              <option value="">-- Select Subject --</option>
              <option *ngFor="let s of subjects" [value]="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="lms-form-group"><label>Task Type</label>
            <select [(ngModel)]="form.type">
              <option value="ASSIGNMENT">Assignment</option>
              <option value="LAB">Lab</option>
              <option value="COURSEWORK">Coursework</option>
              <option value="QUIZ">Quiz</option>
              <option value="EXAM">Exam</option>
            </select>
          </div>
          <div class="lms-form-group"><label>Title</label>
            <input type="text" [(ngModel)]="form.title" placeholder="Task title"/>
          </div>
          <div class="lms-form-group"><label>Max Marks</label>
            <input type="number" [(ngModel)]="form.maxMarks" placeholder="100"/>
          </div>
          <div class="lms-form-group"><label>Deadline</label>
            <input type="datetime-local" [(ngModel)]="form.deadline"/>
          </div>
          <div class="lms-form-group"><label>Description</label>
            <input type="text" [(ngModel)]="form.description" placeholder="Optional description"/>
          </div>
        </div>
        <button class="btn-primary-lms" (click)="createTask()">Create Task</button>
        <div *ngIf="successMsg" style="margin-top:12px;padding:10px 14px;background:#ECFDF5;border-radius:8px;color:#059669;font-size:13px">✅ {{ successMsg }}</div>
      </div>

      <!-- Task List -->
      <div class="lms-card">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:16px">All My Tasks</h3>
        <table class="lms-table" *ngIf="tasks.length > 0; else noTasks">
          <thead><tr><th>Title</th><th>Subject</th><th>Type</th><th>Max Marks</th><th>Deadline</th></tr></thead>
          <tbody>
            <tr *ngFor="let t of tasks">
              <td>{{ t.title }}</td>
              <td>{{ t.subject?.name }}</td>
              <td><span class="badge-lms blue">{{ t.type }}</span></td>
              <td>{{ t.maxMarks }}</td>
              <td>{{ t.deadline ? (t.deadline | date:'dd MMM yyyy') : '—' }}</td>
            </tr>
          </tbody>
        </table>
        <ng-template #noTasks><p style="color:#64748B;padding:12px 0">No tasks created yet.</p></ng-template>
      </div>
    </div>
  `
})
export class TeacherTasksComponent implements OnInit {
    subjects: any[] = [];
    tasks: any[] = [];
    form = { subjectId: '', title: '', type: 'ASSIGNMENT', maxMarks: 100, deadline: '', description: '' };
    successMsg = '';

    constructor(private api: ApiService, private auth: AuthService) { }

    get teacherId() { return this.auth.getUser()?.userId; }

    ngOnInit(): void {
        if (!this.teacherId) return;
        this.api.get<any[]>('subjects', { teacherId: String(this.teacherId) }).subscribe({
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

    createTask(): void {
        if (!this.form.subjectId || !this.form.title) return;
        const payload = {
            title: this.form.title,
            type: this.form.type,
            maxMarks: this.form.maxMarks,
            deadline: this.form.deadline || null,
            description: this.form.description || null,
            teacherId: this.teacherId
        };
        this.api.post<any>(`subjects/${this.form.subjectId}/tasks`, payload).subscribe({
            next: t => {
                this.tasks.push(t);
                this.successMsg = 'Task created successfully!';
                this.form = { subjectId: '', title: '', type: 'ASSIGNMENT', maxMarks: 100, deadline: '', description: '' };
                setTimeout(() => this.successMsg = '', 3000);
            }, error: () => { }
        });
    }
}

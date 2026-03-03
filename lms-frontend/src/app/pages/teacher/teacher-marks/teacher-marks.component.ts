import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-teacher-marks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:20px">Enter Marks ✏️</h1>

      <div class="lms-card" style="margin-bottom:20px">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:16px">Select Task</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="lms-form-group">
            <label>Subject</label>
            <select [(ngModel)]="selectedSubject" (change)="onSubjectChange()">
              <option value="">-- Select Subject --</option>
              <option *ngFor="let s of subjects" [value]="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="lms-form-group">
            <label>Task</label>
            <select [(ngModel)]="selectedTask" (change)="onTaskChange()">
              <option value="">-- Select Task --</option>
              <option *ngFor="let t of tasks" [value]="t.id">{{ t.title }} (max: {{ t.maxMarks }})</option>
            </select>
          </div>
        </div>
      </div>

      <div class="lms-card" *ngIf="selectedTask">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:16px">Student Marks Entry</h3>
        <p style="color:#64748B;font-size:13px;margin-bottom:16px">Enter marks for each student. Click "Save" to submit individual marks.</p>
        <table class="lms-table">
          <thead><tr><th>Student</th><th>Marks Obtained</th><th>Max Marks</th><th>Action</th></tr></thead>
          <tbody>
            <tr *ngFor="let s of students">
              <td>{{ s.name }}</td>
              <td>
                <input type="number" [(ngModel)]="s.marksInput" min="0" [max]="selectedTaskData?.maxMarks"
                       style="width:80px;padding:6px 8px;border:1px solid #E5E7F0;border-radius:6px"/>
              </td>
              <td>{{ selectedTaskData?.maxMarks }}</td>
              <td>
                <button class="btn-primary-lms" (click)="saveMark(s)" style="padding:6px 14px;font-size:13px">Save</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="students.length === 0" style="color:#64748B;font-size:13px;padding:12px 0">No students found for this class.</p>
      </div>

      <div *ngIf="successMsg" style="margin-top:16px;padding:12px 16px;background:#ECFDF5;border:1px solid #A7F3D0;border-radius:8px;color:#059669;font-size:13px">
        ✅ {{ successMsg }}
      </div>
    </div>
  `
})
export class TeacherMarksComponent implements OnInit {
  subjects: any[] = [];
  tasks: any[] = [];
  students: any[] = [];
  selectedSubject = '';
  selectedTask = '';
  selectedTaskData: any = null;
  successMsg = '';

  constructor(private api: ApiService, private auth: AuthService) { }

  get teacherId() { return this.auth.getUser()?.userId; }

  ngOnInit(): void {
    if (!this.teacherId) return;
    this.api.get<any[]>('subjects', { teacherId: String(this.teacherId) }).subscribe({
      next: s => this.subjects = s, error: () => { }
    });
  }

  onSubjectChange(): void {
    this.tasks = [];
    this.students = [];
    this.selectedTask = '';
    this.selectedTaskData = null;
    if (!this.selectedSubject) return;

    const subject = this.subjects.find(s => s.id === +this.selectedSubject);
    if (!subject || !subject.schoolClass) return;

    this.api.get<any[]>(`subjects/${this.selectedSubject}/tasks`).subscribe({
      next: t => this.tasks = t, error: () => { }
    });

    // Load students for the class associated with this subject
    this.api.get<any[]>(`users/class/${subject.schoolClass.id}`).subscribe({
      next: s => this.students = s.map(st => ({ ...st, marksInput: null, isAlreadyGraded: false })),
      error: () => { }
    });
  }

  onTaskChange(): void {
    if (!this.selectedTask) {
      this.selectedTaskData = null;
      return;
    }
    this.selectedTaskData = this.tasks.find(t => t.id === +this.selectedTask);

    // Load existing marks for this task
    this.api.get<any[]>(`marks/task/${this.selectedTask}`).subscribe({
      next: existingMarks => {
        this.students.forEach(student => {
          const mark = existingMarks.find(m => m.studentId === student.id);
          if (mark) {
            student.marksInput = mark.marksObtained;
            student.isAlreadyGraded = true;
          } else {
            student.marksInput = null;
            student.isAlreadyGraded = false;
          }
        });
      }, error: () => { }
    });
  }

  saveMark(student: any): void {
    if (student.marksInput === null || student.marksInput === undefined) return;
    const payload = {
      taskId: +this.selectedTask,
      studentId: student.id,
      marksObtained: student.marksInput
    };
    this.api.post<any>('marks', payload).subscribe({
      next: () => {
        student.isAlreadyGraded = true;
        this.successMsg = `Marks saved for ${student.name}`;
        setTimeout(() => this.successMsg = '', 3000);
      }, error: () => { }
    });
  }
}

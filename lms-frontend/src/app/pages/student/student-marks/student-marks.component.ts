import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
    selector: 'app-student-marks',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="fade-in">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:20px">Marks & GPA</h1>

      <!-- GPA Card -->
      <div class="lms-card" style="margin-bottom:20px;background:linear-gradient(135deg,#5B6EF5,#4255D4);color:white">
        <div style="display:flex;align-items:center;gap:24px">
          <div style="text-align:center">
            <div style="font-size:48px;font-weight:800;line-height:1">{{ overallGpa }}</div>
            <div style="font-size:13px;opacity:0.85;margin-top:4px">Overall GPA (4.0 scale)</div>
          </div>
          <div style="flex:1;border-left:1px solid rgba(255,255,255,0.2);padding-left:24px">
            <div style="font-size:15px;font-weight:600;margin-bottom:8px">{{ gradeLabel }}</div>
            <div style="font-size:13px;opacity:0.8">Pass mark: 40/100 | Total tasks graded: {{ marks.length }}</div>
          </div>
        </div>
      </div>

      <!-- Marks Table -->
      <div class="lms-card">
        <h3 style="font-size:16px;font-weight:600;margin-bottom:16px">All Task Marks</h3>
        <table class="lms-table" *ngIf="marks.length > 0; else noMarks">
          <thead>
            <tr>
              <th>Task</th>
              <th>Marks</th>
              <th>Max</th>
              <th>%</th>
              <th>GPA</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of marks">
              <td>{{ m.taskTitle }}</td>
              <td><strong>{{ m.marksObtained }}</strong></td>
              <td>{{ m.maxMarks }}</td>
              <td>{{ m.percentageScore }}%</td>
              <td>{{ m.gpa }}</td>
              <td>
                <span class="badge-lms" [class.green]="m.marksObtained >= 40" [class.red]="m.marksObtained < 40">
                  {{ m.marksObtained >= 40 ? 'Pass' : 'Fail' }}
                </span>
              </td>
              <td>{{ m.updatedAt | date:'dd MMM yy' }}</td>
            </tr>
          </tbody>
        </table>
        <ng-template #noMarks>
          <div style="text-align:center;padding:40px;color:#64748B">
            <div style="font-size:40px;margin-bottom:12px">📊</div>
            <p>No marks recorded yet. Check back after your tasks are graded.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class StudentMarksComponent implements OnInit {
    marks: any[] = [];
    overallGpa = '0.00';
    gradeLabel = '';

    constructor(private api: ApiService) { }

    ngOnInit(): void {
        // In a real app get studentId from auth. Using placeholder for now.
        const uid = JSON.parse(localStorage.getItem('lms_user') || '{}').userId;
        if (!uid) return;
        this.api.get<any[]>(`marks/student/${uid}`).subscribe({
            next: m => {
                this.marks = m;
                const avg = m.length ? m.reduce((s, x) => s + (x.gpa || 0), 0) / m.length : 0;
                this.overallGpa = avg.toFixed(2);
                this.gradeLabel = avg >= 3.7 ? 'A – Excellent' : avg >= 3.0 ? 'B – Good' : avg >= 2.0 ? 'C – Average' : avg >= 1.0 ? 'D – Below Average (Passing)' : 'F – Fail';
            }
        });
    }
}

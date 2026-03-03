import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-teacher-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:20px">Mark Attendance 📅</h1>
      <div class="lms-card" style="margin-bottom:20px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px">
          <div class="lms-form-group"><label>Class</label>
            <select [(ngModel)]="selectedClass" (change)="loadStudents()">
              <option value="">-- Select Class --</option>
              <option *ngFor="let c of classes" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="lms-form-group"><label>Date</label>
            <input type="date" [(ngModel)]="selectedDate"/>
          </div>
        </div>
        <table class="lms-table" *ngIf="students.length > 0">
          <thead><tr><th>Student</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            <tr *ngFor="let s of students">
              <td>{{ s.name }}</td>
              <td>
                <select [(ngModel)]="s.status" style="padding:5px 10px;border:1px solid #E5E7F0;border-radius:6px">
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                  <option value="EXCUSED">Excused</option>
                </select>
              </td>
              <td>
                <button class="btn-primary-lms" (click)="markAttendance(s)" style="padding:6px 14px;font-size:13px">Save</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="selectedClass && students.length === 0" style="color:#64748B;padding:12px 0;">No students found for this class.</p>
      </div>
      <div *ngIf="successMsg" style="padding:12px 16px;background:#ECFDF5;border:1px solid #A7F3D0;border-radius:8px;color:#059669;font-size:13px">✅ {{ successMsg }}</div>
    </div>
  `
})
export class TeacherAttendanceComponent implements OnInit {
  classes: any[] = [];
  students: any[] = [];
  selectedClass = '';
  selectedDate = new Date().toISOString().split('T')[0];
  successMsg = '';

  constructor(private api: ApiService, private auth: AuthService) { }

  ngOnInit(): void {
    const uid = this.auth.getUser()?.userId;
    if (!uid) return;
    // Fetch subjects taught by teacher to get their classes
    this.api.get<any[]>('subjects', { teacherId: String(uid) }).subscribe({
      next: subjects => {
        const uniqueClasses = new Map();
        subjects.forEach(s => {
          if (s.schoolClass) uniqueClasses.set(s.schoolClass.id, s.schoolClass);
        });
        this.classes = Array.from(uniqueClasses.values());
      }
    });
  }

  loadStudents(): void {
    if (!this.selectedClass || !this.selectedDate) return;
    this.students = [];

    // 1. Load all students in the class
    this.api.get<any[]>(`users/class/${this.selectedClass}`).subscribe({
      next: allStudents => {
        // 2. Load existing attendance for this class and date
        this.api.get<any[]>(`attendance/class/${this.selectedClass}`, { date: this.selectedDate }).subscribe({
          next: attendanceRecords => {
            this.students = allStudents.map(student => {
              const record = attendanceRecords.find(r => r.student?.id === student.id);
              return {
                ...student,
                status: record ? record.status : 'PRESENT',
                isAlreadyMarked: !!record
              };
            });
          }
        });
      }
    });
  }

  markAttendance(student: any): void {
    const uid = this.auth.getUser()?.userId;
    const payload = {
      studentId: student.id,
      classId: +this.selectedClass,
      recordedById: uid,
      date: this.selectedDate,
      status: student.status
    };
    this.api.post<any>('attendance/mark', payload).subscribe({
      next: (res) => {
        student.isAlreadyMarked = true;
        this.successMsg = `Attendance saved for ${student.name}`;
        setTimeout(() => this.successMsg = '', 2500);
      }, error: () => { }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-student-subjects',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fade-in">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:20px">My Subjects</h1>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
        <div *ngFor="let s of subjects" class="lms-card">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            <div style="width:44px;height:44px;border-radius:10px;background:#EEF0FF;display:flex;align-items:center;justify-content:center;font-size:22px">📚</div>
            <div>
              <div style="font-weight:600;font-size:15px">{{ s.name }}</div>
              <div style="color:#64748B;font-size:12px;margin-top:2px">{{ s.schoolClass?.name || 'Class N/A' }}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="badge-lms blue">{{ s.tasks?.length || 0 }} tasks</span>
            <span class="badge-lms gray" *ngIf="s.hasExam">Has Exam</span>
          </div>
        </div>
        <div *ngIf="subjects.length===0" style="grid-column:1/-1;text-align:center;padding:60px;color:#64748B">
          <div style="font-size:40px;margin-bottom:12px">📚</div>
          <p>No subjects assigned yet. Contact your school administrator.</p>
        </div>
      </div>
    </div>
  `
})
export class StudentSubjectsComponent implements OnInit {
    subjects: any[] = [];
    constructor(private api: ApiService, private auth: AuthService) { }
    ngOnInit(): void {
        // Students see subjects based on their class.  Use general subjects endpoint for now.
        this.api.get<any[]>('subjects').subscribe({ next: s => this.subjects = s, error: () => { } });
    }
}

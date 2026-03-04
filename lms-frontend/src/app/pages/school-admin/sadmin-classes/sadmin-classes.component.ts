import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sadmin-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <h1 style="font-size:22px;font-weight:700">Class & Subject Management 🏫</h1>
        <button class="btn-primary-lms" (click)="showClassForm=!showClassForm; isEditClass=false">{{ showClassForm ? 'Cancel' : '+ New Class' }}</button>
      </div>

      <!-- Class Form (Create/Edit) -->
      <div class="lms-card" style="margin-bottom:20px" *ngIf="showClassForm">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:16px">{{ isEditClass ? 'Edit Class' : 'Create New Class' }}</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px">
          <div class="lms-form-group"><label>Class Name</label><input type="text" [(ngModel)]="classForm.name" placeholder="e.g. Grade 10-A"/></div>
          <div class="lms-form-group"><label>Section</label>
            <select [(ngModel)]="classForm.sectionType">
              <option value="PRIMARY">Primary</option>
              <option value="OL">O/Level</option>
              <option value="AL">A/Level</option>
            </select>
          </div>
          <div class="lms-form-group"><label>Academic Manager</label>
            <select [(ngModel)]="classForm.managerId">
              <option value="">-- Select Manager --</option>
              <option *ngFor="let m of managers" [value]="m.id">{{ m.name }}</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn-primary-lms" (click)="saveClass()">{{ isEditClass ? 'Update Class' : 'Create Class' }}</button>
          <button *ngIf="isEditClass" class="btn-outline-lms" style="color:#DC2626;border-color:#FCA5A5" (click)="deleteClass()">Delete Class</button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 2fr;gap:20px">
        <!-- Classes List -->
        <div class="lms-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <h3 style="font-size:15px;font-weight:600">Classes</h3>
            <span style="font-size:12px;color:#64748B">{{ classes.length }} total</span>
          </div>
          <div *ngFor="let c of classes" (click)="selectClass(c)" 
               class="clickable-item" [class.active]="selectedClass?.id === c.id"
               style="padding:12px;border-radius:8px;margin-bottom:8px;cursor:pointer;position:relative">
            <div style="font-weight:600">{{ c.name }}</div>
            <div style="font-size:12px;color:#64748B">{{ c.sectionType }} | {{ c.academicManager?.name }}</div>
            <button (click)="$event.stopPropagation(); editClass(c)" 
                    style="position:absolute;top:10px;right:10px;background:none;border:none;color:#5B6EF5;font-size:16px">⚙️</button>
          </div>
        </div>

        <!-- Class Details & Tabs -->
        <div class="lms-card" *ngIf="selectedClass">
          <div style="display:flex;gap:20px;border-bottom:1px solid #E5E7F0;margin-bottom:20px">
            <button (click)="activeTab='subjects'" [class.active-tab]="activeTab==='subjects'" class="tab-btn">Subjects</button>
            <button (click)="activeTab='students'" [class.active-tab]="activeTab==='students'" class="tab-btn">Students</button>
          </div>

          <!-- Subjects Tab -->
          <div *ngIf="activeTab==='subjects'">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
              <h3 style="font-size:16px;font-weight:700">Subjects</h3>
              <button class="btn-outline-lms" (click)="showSubjectForm=!showSubjectForm; isEditSub=false" style="font-size:12px">
                {{ showSubjectForm ? 'Cancel' : '+ Add Subject' }}
              </button>
            </div>

            <!-- Subject Form -->
            <div *ngIf="showSubjectForm" style="padding:14px;background:#F8FAFC;border-radius:10px;margin-bottom:20px;border:1px solid #E5E7F0">
              <h4 style="font-size:13px;font-weight:600;margin-bottom:12px">{{ isEditSub ? 'Edit Subject' : 'Add New Subject' }}</h4>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
                <div class="lms-form-group"><label>Subject Name</label><input type="text" [(ngModel)]="subForm.name" placeholder="Mathematics"/></div>
                <div class="lms-form-group"><label>Primary Teacher</label>
                  <select [(ngModel)]="subForm.teacherId">
                    <option value="">-- Select Teacher --</option>
                    <option *ngFor="let t of teachers" [value]="t.id">{{ t.name }}</option>
                  </select>
                </div>
              </div>
              <div style="display:flex;gap:10px">
                <button class="btn-primary-lms" (click)="saveSubject()">{{ isEditSub ? 'Update Subject' : 'Add Subject' }}</button>
                <button *ngIf="isEditSub" class="btn-outline-lms" style="color:#DC2626;border-color:#FCA5A5" (click)="deleteSubject()">Remove</button>
              </div>
            </div>

            <table class="lms-table">
              <thead><tr><th>Subject</th><th>Teacher</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let s of subjects">
                  <td><strong>{{ s.name }}</strong></td>
                  <td>{{ s.teachers && s.teachers.length ? s.teachers[0].name : 'Not assigned' }}</td>
                  <td>
                    <button class="btn-link" (click)="editSub(s)">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Students Tab -->
          <div *ngIf="activeTab==='students'">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
              <h3 style="font-size:16px;font-weight:700">Enrolled Students</h3>
              <button class="btn-outline-lms" (click)="showEnrollForm=!showEnrollForm" style="font-size:12px">{{ showEnrollForm ? 'Cancel' : '+ Enroll Student' }}</button>
            </div>

            <!-- Enroll Student Form -->
            <div *ngIf="showEnrollForm" style="padding:14px;background:#F8FAFC;border-radius:10px;margin-bottom:20px;border:1px solid #E5E7F0">
                <div class="lms-form-group">
                    <label>Search Student</label>
                    <div style="display:flex;gap:10px">
                        <input type="text" [(ngModel)]="studentSearch" placeholder="Student name or email..." style="flex:1"/>
                        <button class="btn-primary-lms" (click)="enrollStudent()">Enroll</button>
                    </div>
                </div>
            </div>

            <table class="lms-table">
              <thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let stu of classStudents">
                  <td>{{ stu.name }}</td>
                  <td>{{ stu.email }}</td>
                  <td><button class="btn-link" style="color:#DC2626" (click)="removeStudent(stu)">Remove</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .clickable-item { border: 1px solid #E5E7F0; transition: all 0.2s; }
    .clickable-item:hover { border-color: #5B6EF5; background: #F5F6FA; }
    .clickable-item.active { border-color: #5B6EF5; background: #EEF1FF; }
    .tab-btn { background:none; border:none; padding:10px 0; font-weight:600; color:#64748B; cursor:pointer; position:relative; }
    .tab-btn.active-tab { color:#5B6EF5; }
    .tab-btn.active-tab::after { content:''; position:absolute; bottom:0; left:0; width:100%; height:2px; background:#5B6EF5; }
    .btn-link { background:none; border:none; color:#5B6EF5; font-size:12px; cursor:pointer; padding:0; text-decoration:underline; }
  `]
})
export class SadminClassesComponent implements OnInit {
  classes: any[] = [];
  managers: any[] = [];
  teachers: any[] = [];
  selectedClass: any = null;
  subjects: any[] = [];
  classStudents: any[] = [];
  activeTab = 'subjects';

  showClassForm = false;
  isEditClass = false;
  classForm = { id: undefined as any, name: '', sectionType: 'OL', managerId: '' };

  showSubjectForm = false;
  isEditSub = false;
  subForm = { id: undefined as any, name: '', teacherId: '' };

  showEnrollForm = false;
  studentSearch = '';

  constructor(private api: ApiService, private auth: AuthService) { }

  ngOnInit(): void {
    this.loadClasses();
    this.api.get<any[]>('users', { role: 'ACADEMIC_MANAGER' }).subscribe({ next: u => this.managers = u });
    this.api.get<any[]>('users', { role: 'TEACHER' }).subscribe({ next: u => this.teachers = u });
  }

  loadClasses(): void {
    this.api.get<any[]>('classes').subscribe({ next: c => this.classes = c });
  }

  selectClass(cls: any): void {
    this.selectedClass = cls;
    this.showSubjectForm = false;
    this.showEnrollForm = false;
    this.api.get<any[]>('subjects', { classId: String(cls.id) }).subscribe({ next: s => this.subjects = s });
    this.api.get<any[]>(`users/class/${cls.id}`).subscribe({ next: s => this.classStudents = s });
  }

  editClass(c: any): void {
    this.isEditClass = true;
    this.showClassForm = true;
    this.classForm = { ...c, managerId: c.academicManager?.id };
  }

  saveClass(): void {
    if (!this.classForm.name || !this.classForm.managerId) return;
    const payload = { ...this.classForm, updatedById: this.auth.getUser()?.userId, createdById: this.auth.getUser()?.userId };

    if (this.isEditClass) {
      this.api.put<any>(`classes/${this.classForm.id}`, payload).subscribe({
        next: c => {
          this.loadClasses();
          this.showClassForm = false;
        }
      });
    } else {
      this.api.post<any>('classes', payload).subscribe({
        next: c => {
          this.classes.push(c);
          this.showClassForm = false;
          this.classForm = { id: undefined, name: '', sectionType: 'OL', managerId: '' };
        }
      });
    }
  }

  deleteClass(): void {
    if (!confirm('Are you sure you want to delete this class?')) return;
    this.api.delete(`classes/${this.classForm.id}`, { deletedById: String(this.auth.getUser()?.userId) }).subscribe({
      next: () => {
        this.loadClasses();
        this.showClassForm = false;
        this.selectedClass = null;
      }
    });
  }

  editSub(s: any): void {
    this.isEditSub = true;
    this.showSubjectForm = true;
    this.subForm = { ...s, teacherId: s.teachers?.length ? s.teachers[0].id : '' };
  }

  saveSubject(): void {
    if (!this.subForm.name || !this.selectedClass) return;

    if (this.isEditSub) {
      const payload = { ...this.subForm, classId: this.selectedClass.id, updatedById: this.auth.getUser()?.userId };
      this.api.put<any>(`subjects/${this.subForm.id}`, payload).subscribe({
        next: () => {
          if (this.subForm.teacherId) {
            this.api.post(`subjects/${this.subForm.id}/assign-teacher/${this.subForm.teacherId}`, {}).subscribe(() => this.selectClass(this.selectedClass));
          } else {
            this.selectClass(this.selectedClass);
          }
          this.showSubjectForm = false;
        }
      });
    } else {
      const payload = {
        name: this.subForm.name,
        classId: this.selectedClass.id,
        createdById: this.auth.getUser()?.userId,
        hasExam: false,
        weightingConfig: '{}'
      };
      this.api.post<any>('subjects', payload).subscribe({
        next: s => {
          if (this.subForm.teacherId) {
            this.api.post(`subjects/${s.id}/assign-teacher/${this.subForm.teacherId}`, {}).subscribe(() => this.selectClass(this.selectedClass));
          } else {
            this.selectClass(this.selectedClass);
          }
          this.showSubjectForm = false;
        }
      });
    }
  }

  deleteSubject(): void {
    if (!confirm('Remove this subject?')) return;
    this.api.delete(`subjects/${this.subForm.id}`, { deletedById: String(this.auth.getUser()?.userId) }).subscribe({
      next: () => {
        this.selectClass(this.selectedClass);
        this.showSubjectForm = false;
      }
    });
  }

  enrollStudent(): void {
    const stu = this.studentSearch.trim();
    if (!stu || !this.selectedClass) return;

    // Search for student using the new backend search endpoint
    this.api.get<any[]>('users/search', { query: stu }).subscribe(results => {
      // Find exact match or pick first if only one
      const match = results.find(u => (u.email === stu || u.name === stu) && u.role === 'STUDENT') || (results.length === 1 && results[0].role === 'STUDENT' ? results[0] : null);

      if (match) {
        this.api.post(`classes/${this.selectedClass.id}/enroll/${match.id}`, { actionById: this.auth.getUser()?.userId }).subscribe({
          next: () => {
            this.selectClass(this.selectedClass);
            this.studentSearch = '';
            this.showEnrollForm = false;
          }
        });
      } else {
        alert('Student not found. Please enter exact name or email.');
      }
    });
  }

  removeStudent(stu: any): void {
    if (!confirm(`Remove ${stu.name} from this class?`)) return;
    this.api.delete(`classes/${this.selectedClass.id}/remove/${stu.id}`, { actionById: String(this.auth.getUser()?.userId) }).subscribe({
      next: () => {
        this.selectClass(this.selectedClass);
      }
    });
  }
}

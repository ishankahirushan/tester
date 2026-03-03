import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
    selector: 'app-sadmin-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="fade-in">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:20px">System Settings ⚙️</h1>
      
      <div class="lms-card" style="max-width:800px">
        <h3 style="font-size:16px;font-weight:700;margin-bottom:20px">School Configuration</h3>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
          <div class="lms-form-group">
            <label>School Name</label>
            <input type="text" [(ngModel)]="settings.schoolName" placeholder="Full name of school"/>
          </div>
          <div class="lms-form-group">
            <label>Motto</label>
            <input type="text" [(ngModel)]="settings.motto" placeholder="Learning for life..."/>
          </div>
          <div class="lms-form-group">
            <label>Academic Year</label>
            <input type="text" [(ngModel)]="settings.currentAcademicYear" placeholder="2026"/>
          </div>
          <div class="lms-form-group">
            <label>Current Term</label>
            <select [(ngModel)]="settings.currentTerm">
              <option value="Term 1">First Term (Term 1)</option>
              <option value="Term 2">Second Term (Term 2)</option>
              <option value="Term 3">Third Term (Term 3)</option>
            </select>
          </div>
          <div class="lms-form-group">
            <label>Contact Email</label>
            <input type="email" [(ngModel)]="settings.email" placeholder="admin@school.lms"/>
          </div>
          <div class="lms-form-group">
            <label>Phone Number</label>
            <input type="text" [(ngModel)]="settings.phone" placeholder="+94 ..."/>
          </div>
          <div class="lms-form-group" style="grid-column: span 2">
            <label>Physical Address</label>
            <textarea [(ngModel)]="settings.address" rows="2" placeholder="School Street, City..."></textarea>
          </div>
        </div>

        <div style="margin-top:24px;display:flex;align-items:center;gap:15px">
          <button class="btn-primary-lms" (click)="saveSettings()" [disabled]="loading">
            {{ loading ? 'Saving...' : '💾 Save All Changes' }}
          </button>
          <span *ngIf="successMsg" style="color:#059669;font-size:13px;font-weight:600">✅ Settings Updated!</span>
        </div>
      </div>

      <div class="lms-card" style="margin-top:24px;max-width:800px;background:#FEF2F2;border-color:#FCA5A5">
          <h3 style="font-size:15px;font-weight:600;color:#991B1B;margin-bottom:12px">Danger Zone</h3>
          <p style="font-size:13px;color:#991B1B;margin-bottom:16px">These actions are irreversible and affect all users in the system.</p>
          <button class="btn-outline-lms" style="color:#DC2626;border-color:#DC2626" (click)="resetSystem()">
            Reset System Data
          </button>
      </div>
    </div>
  `,
    styles: [`
    textarea { width:100%; padding:12px; border:1px solid #E5E7F0; border-radius:10px; font-family:inherit; }
  `]
})
export class SadminSettingsComponent implements OnInit {
    settings: any = {};
    loading = false;
    successMsg = false;

    constructor(private api: ApiService) { }

    ngOnInit(): void {
        this.api.get<any>('settings').subscribe(s => this.settings = s);
    }

    saveSettings(): void {
        this.loading = true;
        this.api.put<any>('settings', this.settings).subscribe({
            next: (res) => {
                this.settings = res;
                this.loading = false;
                this.successMsg = true;
                setTimeout(() => this.successMsg = false, 3000);
            },
            error: () => { this.loading = false; alert('Failed to save settings.'); }
        });
    }

    resetSystem(): void {
        if (confirm('CRITICAL: This will clear all transient data and reset the system. Proceed?')) {
            alert('Reset functionality not yet connected to backend for safety.');
        }
    }
}

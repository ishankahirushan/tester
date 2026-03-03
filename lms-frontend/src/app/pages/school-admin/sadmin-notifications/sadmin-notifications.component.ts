import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-sadmin-notifications',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="fade-in">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:20px">Post Announcements 📣</h1>
      
      <div class="lms-card" style="max-width:600px">
        <h3 style="font-size:16px;font-weight:700;margin-bottom:20px">Compose Notification</h3>
        
        <div class="lms-form-group">
          <label>Title</label>
          <input type="text" [(ngModel)]="notifForm.title" placeholder="e.g. School Holiday Notice"/>
        </div>

        <div class="lms-form-group" style="margin-top:16px">
          <label>Message Content</label>
          <textarea [(ngModel)]="notifForm.message" rows="4" placeholder="Detailed announcement message..." style="width:100%;padding:12px;border:1px solid #E5E7F0;border-radius:10px;font-family:inherit"></textarea>
        </div>

        <div class="lms-form-group" style="margin-top:16px">
          <label>Target Audience</label>
          <select [(ngModel)]="notifForm.targetRole">
            <option value="">Everyone (All Roles)</option>
            <option value="STUDENT">Students Only</option>
            <option value="TEACHER">Teachers Only</option>
            <option value="ACADEMIC_MANAGER">Managers Only</option>
          </select>
        </div>

        <div style="margin-top:24px;display:flex;align-items:center;gap:15px">
          <button class="btn-primary-lms" (click)="postNotif()" [disabled]="loading">
            {{ loading ? 'Posting...' : '🚀 Post Announcement' }}
          </button>
          <span *ngIf="successMsg" style="color:#059669;font-size:13px;font-weight:600">✅ Posted Successfully!</span>
          <span *ngIf="errorMsg" style="color:#DC2626;font-size:13px">{{ errorMsg }}</span>
        </div>
      </div>

      <div class="lms-card" style="margin-top:24px;max-width:600px">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:16px">Recent Sent Announcements</h3>
        <div *ngFor="let n of sentNotifs" style="padding:12px 0;border-bottom:1px solid #F1F5F9">
          <div style="font-weight:700;font-size:13px">{{ n.title }}</div>
          <div style="font-size:12px;color:#64748B;margin-top:2px">{{ n.message }}</div>
          <div style="font-size:11px;color:#94A3B8;margin-top:4px">
            To: {{ n.targetRole || 'Everyone' }} | {{ n.createdAt | date:'short' }}
          </div>
        </div>
        <p *ngIf="sentNotifs.length === 0" style="text-align:center;color:#94A3B8;padding:20px;font-size:13px">No historical posts found.</p>
      </div>
    </div>
  `
})
export class SadminNotificationsComponent implements OnInit {
    notifForm = { title: '', message: '', targetRole: '' };
    loading = false;
    successMsg = false;
    errorMsg = '';
    sentNotifs: any[] = [];

    constructor(private api: ApiService, private auth: AuthService) { }

    ngOnInit(): void {
        this.loadHistory();
    }

    loadHistory(): void {
        this.api.get<any[]>('notifications').subscribe(n => {
            // Filter manually for now or if backend supports it
            this.sentNotifs = n.reverse().slice(0, 5);
        });
    }

    postNotif(): void {
        if (!this.notifForm.title || !this.notifForm.message) {
            this.errorMsg = 'Please fill title and message.'; return;
        }
        this.loading = true;
        this.errorMsg = '';
        const payload = {
            ...this.notifForm,
            createdById: this.auth.getUser()?.userId
        };

        this.api.post('notifications', payload).subscribe({
            next: () => {
                this.loading = false;
                this.successMsg = true;
                this.notifForm = { title: '', message: '', targetRole: '' };
                this.loadHistory();
                setTimeout(() => this.successMsg = false, 3000);
            },
            error: () => { this.loading = false; this.errorMsg = 'Failed to post.'; }
        });
    }
}

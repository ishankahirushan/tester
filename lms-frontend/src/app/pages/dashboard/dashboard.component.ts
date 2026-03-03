import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    template: `<div style="display:flex;align-items:center;justify-content:center;height:100vh">
    <p style="color:#64748B">Redirecting…</p>
  </div>`
})
export class DashboardComponent implements OnInit {
    constructor(private auth: AuthService, private router: Router) { }
    ngOnInit(): void {
        const role = this.auth.getRole();
        const map: Record<string, string> = {
            SUPER_ADMIN: '/school-admin/dashboard',
            SCHOOL_ADMIN: '/school-admin/dashboard',
            ACADEMIC_ADMIN: '/academic-admin/dashboard',
            ACADEMIC_MANAGER: '/manager/dashboard',
            TEACHER: '/teacher/dashboard',
            STUDENT: '/student/dashboard',
        };
        this.router.navigate([role ? (map[role] || '/login') : '/login']);
    }
}

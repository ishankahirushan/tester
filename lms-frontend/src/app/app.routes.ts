import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
    },
    // Layout wrapper for all authenticated routes
    {
        path: '',
        loadComponent: () => import('./shared/layout/layout.component').then(m => m.LayoutComponent),
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
            },
            // Student
            {
                path: 'student',
                canActivate: [roleGuard('STUDENT')],
                children: [
                    { path: 'dashboard', loadComponent: () => import('./pages/student/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent) },
                    { path: 'subjects', loadComponent: () => import('./pages/student/student-subjects/student-subjects.component').then(m => m.StudentSubjectsComponent) },
                    { path: 'tasks', loadComponent: () => import('./pages/student/student-tasks/student-tasks.component').then(m => m.StudentTasksComponent) },
                    { path: 'marks', loadComponent: () => import('./pages/student/student-marks/student-marks.component').then(m => m.StudentMarksComponent) },
                    { path: 'attendance', loadComponent: () => import('./pages/student/student-attendance/student-attendance.component').then(m => m.StudentAttendanceComponent) },
                ]
            },
            // Teacher
            {
                path: 'teacher',
                canActivate: [roleGuard('TEACHER')],
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', loadComponent: () => import('./pages/teacher/teacher-dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent) },
                    { path: 'tasks', loadComponent: () => import('./pages/teacher/teacher-tasks/teacher-tasks.component').then(m => m.TeacherTasksComponent) },
                    { path: 'marks', loadComponent: () => import('./pages/teacher/teacher-marks/teacher-marks.component').then(m => m.TeacherMarksComponent) },
                    { path: 'attendance', loadComponent: () => import('./pages/teacher/teacher-attendance/teacher-attendance.component').then(m => m.TeacherAttendanceComponent) },
                ]
            },
            // Academic Manager
            {
                path: 'manager',
                canActivate: [roleGuard('ACADEMIC_MANAGER')],
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', loadComponent: () => import('./pages/academic-manager/manager-dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent) },
                ]
            },
            // Academic Admin
            {
                path: 'academic-admin',
                canActivate: [roleGuard('ACADEMIC_ADMIN')],
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', loadComponent: () => import('./pages/academic-admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
                ]
            },
            // School Admin
            {
                path: 'school-admin',
                canActivate: [roleGuard('SCHOOL_ADMIN')],
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', loadComponent: () => import('./pages/school-admin/sadmin-dashboard/sadmin-dashboard.component').then(m => m.SadminDashboardComponent) },
                    { path: 'users', loadComponent: () => import('./pages/school-admin/sadmin-users/sadmin-users.component').then(m => m.SadminUsersComponent) },
                    { path: 'classes', loadComponent: () => import('./pages/school-admin/sadmin-classes/sadmin-classes.component').then(m => m.SadminClassesComponent) },
                    { path: 'activity-logs', loadComponent: () => import('./pages/school-admin/sadmin-activity-logs/sadmin-activity-logs.component').then(m => m.SadminActivityLogsComponent) },
                    { path: 'notifications', loadComponent: () => import('./pages/school-admin/sadmin-notifications/sadmin-notifications.component').then(m => m.SadminNotificationsComponent) },
                    { path: 'settings', loadComponent: () => import('./pages/school-admin/sadmin-settings/sadmin-settings.component').then(m => m.SadminSettingsComponent) },
                ]
            },
            { path: '**', redirectTo: 'login' }
        ]
    },
    { path: '**', redirectTo: 'login' }
];


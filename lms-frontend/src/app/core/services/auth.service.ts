import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface JwtResponse {
    token: string;
    tokenType: string;
    userId: number;
    name: string;
    email: string;
    role: string;
    expiresInMs: number;
}

const API = 'http://localhost:8080/api/auth';
const TOKEN_KEY = 'lms_token';
const USER_KEY = 'lms_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private userSubject = new BehaviorSubject<JwtResponse | null>(this.loadUser());
    user$ = this.userSubject.asObservable();

    private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

    constructor(private http: HttpClient, private router: Router) {
        if (this.getToken()) this.resetTimer();
    }

    login(email: string, password: string): Observable<JwtResponse> {
        return this.http.post<JwtResponse>(`${API}/login`, { email, password }).pipe(
            tap(res => {
                localStorage.setItem(TOKEN_KEY, res.token);
                localStorage.setItem(USER_KEY, JSON.stringify(res));
                this.userSubject.next(res);
                this.resetTimer();
            })
        );
    }

    logout(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        this.userSubject.next(null);
        if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    getUser(): JwtResponse | null {
        return this.userSubject.getValue();
    }

    getRole(): string | null {
        return this.getUser()?.role ?? null;
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    resetTimer(): void {
        if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
        this.inactivityTimer = setTimeout(() => this.logout(), this.TIMEOUT_MS);
    }

    private loadUser(): JwtResponse | null {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    }
}

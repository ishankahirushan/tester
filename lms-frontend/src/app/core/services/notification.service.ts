import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { switchMap, tap, retry } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationsSubject = new BehaviorSubject<any[]>([]);
    public notifications$ = this.notificationsSubject.asObservable();

    constructor(private api: ApiService, private auth: AuthService) {
        // Poll for notifications every 30 seconds if logged in
        timer(0, 30000).pipe(
            switchMap(() => {
                const user = this.auth.getUser();
                if (!user) return new Observable<any[]>(sub => sub.next([]));
                return this.api.get<any[]>('notifications', { role: user.role });
            }),
            retry(3),
            tap(notifs => this.notificationsSubject.next(notifs))
        ).subscribe();
    }

    getNotifications(): any[] {
        return this.notificationsSubject.value;
    }

    getUnreadCount(): number {
        return this.notificationsSubject.value.length; // Simplified: assumes all fetched are relevant
    }

    sendNotification(payload: any): Observable<any> {
        return this.api.post<any>('notifications', payload);
    }
}

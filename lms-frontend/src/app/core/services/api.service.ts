import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private base = 'http://localhost:8080/api';

    constructor(private http: HttpClient) { }

    get<T>(path: string, params?: Record<string, string>): Observable<T> {
        let hp = new HttpParams();
        if (params) Object.keys(params).forEach(k => hp = hp.set(k, params[k]));
        return this.http.get<T>(`${this.base}/${path}`, { params: hp });
    }

    post<T>(path: string, body: unknown): Observable<T> {
        return this.http.post<T>(`${this.base}/${path}`, body);
    }

    put<T>(path: string, body: unknown): Observable<T> {
        return this.http.put<T>(`${this.base}/${path}`, body);
    }

    delete<T>(path: string, params?: Record<string, string>): Observable<T> {
        let hp = new HttpParams();
        if (params) Object.keys(params).forEach(k => hp = hp.set(k, params[k]));
        return this.http.delete<T>(`${this.base}/${path}`, { params: hp });
    }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginRequest, RegisterRequest, TokenResponse } from '../models/auth';

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'user_data';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/auth`;

  currentUser$ = new BehaviorSubject<AuthUser | null>(this.loadStoredUser());

  login(dto: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.api}/login/`, dto).pipe(
      tap(res => {
        this.setTokens(res.access, res.refresh);
        const user: AuthUser = res.user ?? res.profile ?? null;
        if (user) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          this.currentUser$.next(user);
        }
      })
    );
  }

  register(dto: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.api}/register/`, dto).pipe(
      tap(res => {
        this.setTokens(res.access, res.refresh);
        const user: AuthUser = res.user ?? null;
        if (user) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          this.currentUser$.next(user);
        }
      })
    );
  }

  logout(): Observable<any> {
    const refresh = this.getRefreshToken();
    return this.http.post(`${this.api}/logout/`, { refresh }).pipe(
      tap(() => this.clearSession())
    );
  }

  refresh(): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.api}/token/refresh/`, {
      refresh: this.getRefreshToken(),
    }).pipe(
      tap(res => localStorage.setItem(ACCESS_KEY, res.access))
    );
  }

  setTokens(access: string, refresh: string): void {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser$.next(null);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  checkUsername(username: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(`${this.api}/check-username/`, { params: { username } });
  }

  private loadStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

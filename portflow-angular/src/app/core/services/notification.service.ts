import { Injectable, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { AppNotification, NotificationPage } from '../models/notification';

export interface SseNotification {
  id: number;
  title: string;
  template_code: string | null;
  target_post_id: number | null;
  is_read: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/notifications`;

  readonly newNotification$ = new Subject<SseNotification>();

  private es: EventSource | null = null;
  private reconnectTimer?: ReturnType<typeof setTimeout>;

  connect(): void {
    if (this.es?.readyState === EventSource.OPEN) return;
    this.openEventSource();
  }

  disconnect(): void {
    clearTimeout(this.reconnectTimer);
    this.es?.close();
    this.es = null;
  }

  private openEventSource(): void {
    const token = this.auth.getAccessToken();
    if (!token) return;

    this.es = new EventSource(
      `${environment.apiUrl}/api/notif-stream/?token=${token}`,
    );

    this.es.onmessage = (event) => {
      this.newNotification$.next(JSON.parse(event.data) as SseNotification);
    };

    this.es.onerror = () => {
      this.es?.close();
      this.es = null;
      this.auth.refresh().subscribe({
        next: () => {
          this.reconnectTimer = setTimeout(() => this.openEventSource(), 1000);
        },
        error: () => {},
      });
    };
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.api}/unread_count/`);
  }

  list(page: number): Observable<NotificationPage> {
    return this.http.get<NotificationPage>(`${this.api}/`, { params: { page } });
  }

  markRead(id: number): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.api}/${id}/`, { is_read: true });
  }

  markAllRead(): Observable<unknown> {
    return this.http.patch(`${this.api}/mark_all_read/`, {});
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}

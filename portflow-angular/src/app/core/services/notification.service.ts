import { Injectable, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth';

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

    const url = `${environment.apiUrl}/api/notifications/stream/?token=${token}`;
    this.es = new EventSource(url);

    this.es.onmessage = (event) => {
      this.newNotification$.next(JSON.parse(event.data) as SseNotification);
    };

    this.es.onerror = () => {
      this.es?.close();
      this.es = null;
      this.reconnectTimer = setTimeout(() => this.openEventSource(), 5000);
    };
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AppNotification, NotificationPage } from '../../../core/models/notification';
import { NotificationService } from '../../../core/services/notification.service';
import { Popover } from '../popover/popover';
import { Notification } from '../notification/notification';

@Component({
  selector: 'app-notification-panel',
  imports: [Popover, Notification],
  templateUrl: './notification-panel.html',
  styleUrl: './notification-panel.scss',
})
export class NotificationPanel implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private notifService = inject(NotificationService);

  unreadCount = signal(0);
  notifications = signal<AppNotification[]>([]);
  loading = signal(false);
  hasMore = signal(false);
  private page = 1;

  constructor() {
    this.notifService.newNotification$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.unreadCount.update(c => c + 1));
  }

  ngOnInit(): void {
    this.fetchUnreadCount();
    this.notifService.connect();
  }

  ngOnDestroy(): void {
    // SSE permanece vivo (serviço é root); apenas paramos de escutar
  }

  onPopoverOpened(): void {
    this.page = 1;
    this.notifications.set([]);
    this.fetchNotifications();
  }

  loadMore(): void {
    this.fetchNotifications();
  }

  markRead(id: number): void {
    this.http
      .patch(`${environment.apiUrl}/api/notifications/${id}/`, { is_read: true })
      .subscribe({
        next: () => {
          this.notifications.update(list =>
            list.map(n => (n.id === id ? { ...n, is_read: true } : n))
          );
          this.unreadCount.update(c => Math.max(0, c - 1));
        },
      });
  }

  markAllRead(): void {
    this.http
      .patch(`${environment.apiUrl}/api/notifications/mark_all_read/`, {})
      .subscribe({
        next: () => {
          this.notifications.update(list => list.map(n => ({ ...n, is_read: true })));
          this.unreadCount.set(0);
        },
      });
  }

  private fetchUnreadCount(): void {
    this.http
      .get<{ count: number }>(`${environment.apiUrl}/api/notifications/unread_count/`)
      .subscribe({ next: res => this.unreadCount.set(res.count) });
  }

  private fetchNotifications(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.http
      .get<NotificationPage>(`${environment.apiUrl}/api/notifications/`, {
        params: { page: this.page },
      })
      .subscribe({
        next: res => {
          this.notifications.update(list => [...list, ...res.results]);
          this.hasMore.set(!!res.next);
          this.page++;
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}

import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AppNotification, NotificationPage } from '../../../core/models/notification';
import { Popover } from '../popover/popover';
import { Notification } from '../notification/notification';

const POLL_MS = 5 * 60 * 1000;

@Component({
  selector: 'app-notification-panel',
  imports: [Popover, Notification],
  templateUrl: './notification-panel.html',
  styleUrl: './notification-panel.scss',
})
export class NotificationPanel implements OnInit, OnDestroy {
  private http = inject(HttpClient);

  unreadCount = signal(0);
  notifications = signal<AppNotification[]>([]);
  loading = signal(false);
  hasMore = signal(false);
  private page = 1;
  private pollTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.fetchUnreadCount();
    this.pollTimer = setInterval(() => this.fetchUnreadCount(), POLL_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.pollTimer);
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

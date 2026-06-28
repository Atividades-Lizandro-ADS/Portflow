import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppNotification } from '../../../core/models/notification';
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
    this.notifService.markRead(id).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => (n.id === id ? { ...n, is_read: true } : n))
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      },
    });
  }

  markAllRead(): void {
    this.notifService.markAllRead().subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, is_read: true })));
        this.unreadCount.set(0);
      },
    });
  }

  private fetchUnreadCount(): void {
    this.notifService.getUnreadCount().subscribe({ next: res => this.unreadCount.set(res.count) });
  }

  private fetchNotifications(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.notifService.list(this.page).subscribe({
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

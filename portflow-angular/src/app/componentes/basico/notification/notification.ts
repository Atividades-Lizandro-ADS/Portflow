import { Component, computed, input, output } from '@angular/core';
import { AppNotification } from '../../../core/models/notification';

const ICONS: Record<string, string> = {
  NEW_LIKE: 'bi-heart-fill',
  NEW_COMMENT: 'bi-chat-fill',
  POST_MILESTONE: 'bi-trophy-fill',
  NEW_FOLLOWER: 'bi-person-fill-add',
};

@Component({
  selector: 'app-notification',
  imports: [],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
})
export class Notification {
  notification = input.required<AppNotification>();
  read = output<number>();

  icon = computed(() => ICONS[this.notification().template?.code ?? ''] ?? 'bi-bell-fill');

  timeAgo(): string {
    const diff = Math.floor((Date.now() - new Date(this.notification().created_at).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }

  onPress(): void {
    if (!this.notification().is_read) {
      this.read.emit(this.notification().id);
    }
  }
}

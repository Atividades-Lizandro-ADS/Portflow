import { Component, computed, input } from '@angular/core';
import { Avatar } from '../avatar/avatar';

@Component({
  selector: 'app-chat-list-item',
  imports: [Avatar],
  templateUrl: './chat-list-item.html',
  styleUrl: './chat-list-item.scss',
})
export class ChatListItem {
  avatarUri = input<string | null>(null);
  title = input('');
  subtitle = input<string | null | undefined>(null);
  timestamp = input<string | null>(null);

  timeLabel = computed(() => {
    const value = this.timestamp();
    if (!value) return '';
    const date = new Date(value);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  });
}

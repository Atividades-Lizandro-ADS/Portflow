import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Navbar } from '../../basico/navbar/navbar';
import { Avatar } from '../../basico/avatar/avatar';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Conversation as ConversationService } from '../../../core/services/conversation';
import { Conversation as ConversationModel, ChatMessage } from '../../../core/models/conversation';

@Component({
  selector: 'app-chat',
  imports: [Navbar, Avatar, RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private conversations = inject(ConversationService);
  private notifStream = inject(NotificationService);

  user = toSignal(this.auth.currentUser$);

  conversation = signal<ConversationModel | null>(null);
  messages = signal<ChatMessage[]>([]);
  loading = signal(true);
  text = signal('');
  sending = signal(false);

  constructor() {
    this.notifStream.newChatMessage$
      .pipe(takeUntilDestroyed())
      .subscribe(event => {
        const conversationId = this.conversation()?.id;
        if (!conversationId || event.conversation_id !== conversationId) return;

        this.messages.update(list => {
          if (list.some(m => m.id === event.id)) return list;
          return [...list, {
            id: event.id,
            conversation: event.conversation_id,
            sender: event.sender_id,
            body: event.body,
            message_type: event.message_type as ChatMessage['message_type'],
            related_briefing: null,
            related_extension_request: null,
            is_read: false,
            created_at: event.created_at,
          }];
        });
      });
  }

  ngOnInit(): void {
    this.notifStream.connect();

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.conversations.get(id).subscribe({
      next: c => this.conversation.set(c),
      error: () => {},
    });
    this.conversations.getMessages(id).subscribe({
      next: page => { this.messages.set(page.results); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  isMine(message: ChatMessage): boolean {
    return message.sender === this.user()?.profile_id;
  }

  formatTime(value: string): string {
    return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  onTextInput(event: Event): void {
    this.text.set((event.target as HTMLTextAreaElement).value);
  }

  handleSend(): void {
    const c = this.conversation();
    if (!c || !this.text().trim() || this.sending()) return;

    this.sending.set(true);
    this.conversations.sendMessage(c.id, this.text().trim()).subscribe({
      next: message => {
        this.messages.update(list => [...list, message]);
        this.text.set('');
        this.sending.set(false);
      },
      error: () => this.sending.set(false),
    });
  }
}

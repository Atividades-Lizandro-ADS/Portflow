import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { Navbar } from '../../basico/navbar/navbar';
import { Avatar } from '../../basico/avatar/avatar';
import { AttachMenu } from '../../basico/attach-menu/attach-menu';
import { ChatAttachment } from '../../basico/chat-attachment/chat-attachment';
import { ChatBubble } from '../../basico/chat-bubble/chat-bubble';
import { BriefingFormModal } from '../../basico/briefing-form-modal/briefing-form-modal';
import { BriefingDetailModal } from '../../basico/briefing-detail-modal/briefing-detail-modal';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Conversation as ConversationService } from '../../../core/services/conversation';
import { Conversation as ConversationModel, ChatMessage } from '../../../core/models/conversation';
import { Briefing } from '../../../core/models/briefing';

@Component({
  selector: 'app-chat',
  imports: [
    Navbar, Avatar, RouterLink, AttachMenu, ChatAttachment,
    ChatBubble, BriefingFormModal, BriefingDetailModal,
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private conversations = inject(ConversationService);
  private notifStream = inject(NotificationService);

  user = toSignal(this.auth.currentUser$);

  conversationId = signal<number | null>(null);
  conversation = signal<ConversationModel | null>(null);
  messages = signal<ChatMessage[]>([]);
  loading = signal(true);
  text = signal('');
  sending = signal(false);

  pendingAttachments = signal<File[]>([]);
  briefingFormVisible = signal(false);
  activeBriefing = signal<Briefing | null>(null);

  isClient = computed(() => this.conversation()?.client === this.user()?.profile_id);
  isArtist = computed(() => this.conversation()?.artist === this.user()?.profile_id);
  canSendMessage = computed(() => this.conversation()?.can_send_message ?? true);
  hasPendingBriefing = computed(() =>
    this.messages().some(m => m.related_briefing_detail?.status === 'pending')
  );

  constructor() {
    this.notifStream.newChatMessage$
      .pipe(takeUntilDestroyed())
      .subscribe(event => {
        const id = this.conversationId();
        if (!id || event.conversation_id !== id) return;
        this.refresh();
      });
  }

  ngOnInit(): void {
    this.notifStream.connect();

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.conversationId.set(+id);
    this.loading.set(true);
    this.refresh(() => this.loading.set(false));
  }

  private refresh(onDone?: () => void): void {
    const id = this.conversationId();
    if (!id) { onDone?.(); return; }
    forkJoin({
      conversation: this.conversations.get(id),
      messages: this.conversations.getMessages(id),
    }).subscribe({
      next: ({ conversation, messages }) => {
        this.conversation.set(conversation);
        this.messages.set(messages.results);
        onDone?.();
      },
      error: () => onDone?.(),
    });
  }

  isMine(message: ChatMessage): boolean {
    return message.sender === this.user()?.profile_id;
  }

  onTextInput(event: Event): void {
    this.text.set((event.target as HTMLTextAreaElement).value);
  }

  onPickImage(file: File): void {
    this.pendingAttachments.update(list => [...list, file]);
  }

  onPickFile(file: File): void {
    this.pendingAttachments.update(list => [...list, file]);
  }

  removePendingAttachment(index: number): void {
    this.pendingAttachments.update(list => list.filter((_, i) => i !== index));
  }

  handleSend(): void {
    const id = this.conversationId();
    if (!id || (!this.text().trim() && !this.pendingAttachments().length) || this.sending()) return;

    this.sending.set(true);
    this.conversations.sendMessage(id, this.text().trim(), this.pendingAttachments()).subscribe({
      next: message => {
        this.messages.update(list => [...list, message]);
        this.text.set('');
        this.pendingAttachments.set([]);
        this.sending.set(false);
      },
      error: () => this.sending.set(false),
    });
  }

  onBriefingCreated(): void {
    this.refresh();
  }

  onBriefingResponded(): void {
    this.refresh();
  }
}

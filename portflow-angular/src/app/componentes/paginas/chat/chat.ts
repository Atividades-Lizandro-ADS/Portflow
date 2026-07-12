import {
  Component, DestroyRef, ElementRef, Injector, OnInit, computed, effect,
  inject, signal, viewChild, afterNextRender,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, interval } from 'rxjs';
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
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);

  private messagesEl = viewChild<ElementRef<HTMLDivElement>>('messagesEl');
  private topSentinel = viewChild<ElementRef<HTMLDivElement>>('topSentinel');
  private observer: IntersectionObserver | null = null;

  user = toSignal(this.auth.currentUser$);

  conversationId = signal<number | null>(null);
  conversation = signal<ConversationModel | null>(null);
  messages = signal<ChatMessage[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  hasMoreMessages = signal(false);
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

    effect(() => {
      const container = this.messagesEl();
      const sentinel = this.topSentinel();
      if (!container || !sentinel || this.observer) return;
      this.observer = new IntersectionObserver(
        entries => { if (entries[0].isIntersecting) this.loadOlderMessages(); },
        { root: container.nativeElement, threshold: 0.1 },
      );
      this.observer.observe(sentinel.nativeElement);
    });

    this.destroyRef.onDestroy(() => this.observer?.disconnect());
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
    this.startHeartbeat();
  }

  private startHeartbeat(): void {
    const id = this.conversationId();
    if (!id) return;
    this.conversations.heartbeat(id).subscribe();
    interval(25000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.conversations.heartbeat(id).subscribe());
  }

  private refresh(onDone?: () => void): void {
    const id = this.conversationId();
    if (!id) { onDone?.(); return; }
    const isFirstLoad = this.messages().length === 0;
    forkJoin({
      conversation: this.conversations.get(id),
      messages: this.conversations.getMessages(id),
    }).subscribe({
      next: ({ conversation, messages }) => {
        this.conversation.set(conversation);
        this.mergeLatestMessages(messages.results);
        if (isFirstLoad) this.hasMoreMessages.set(messages.has_more);
        onDone?.();
        this.scrollToBottom();
      },
      error: () => onDone?.(),
    });
  }

  private mergeLatestMessages(latest: ChatMessage[]): void {
    this.messages.update(existing => {
      const byId = new Map(existing.map(m => [m.id, m]));
      for (const m of latest) byId.set(m.id, m);
      return Array.from(byId.values()).sort((a, b) => a.id - b.id);
    });
  }

  private loadOlderMessages(): void {
    const id = this.conversationId();
    const oldestId = this.messages()[0]?.id;
    if (!id || !oldestId || this.loadingMore() || !this.hasMoreMessages()) return;

    const container = this.messagesEl()?.nativeElement;
    const prevScrollHeight = container?.scrollHeight ?? 0;
    const prevScrollTop = container?.scrollTop ?? 0;

    this.loadingMore.set(true);
    this.conversations.getMessages(id, oldestId).subscribe({
      next: page => {
        this.messages.update(list => [...page.results, ...list]);
        this.hasMoreMessages.set(page.has_more);
        this.loadingMore.set(false);
        afterNextRender(() => {
          if (!container) return;
          container.scrollTop = prevScrollTop + (container.scrollHeight - prevScrollHeight);
        }, { injector: this.injector });
      },
      error: () => this.loadingMore.set(false),
    });
  }

  private scrollToBottom(): void {
    afterNextRender(() => {
      const el = this.messagesEl()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, { injector: this.injector });
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
        this.scrollToBottom();
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

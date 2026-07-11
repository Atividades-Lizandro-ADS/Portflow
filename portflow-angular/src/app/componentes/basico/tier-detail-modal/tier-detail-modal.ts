import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { Conversation as ConversationService } from '../../../core/services/conversation';
import { Tier, NegotiationDirection } from '../../../core/models/tier';

const NEGOTIATION_LABELS: Record<NegotiationDirection, string> = {
  up: 'pode ficar mais caro',
  down: 'pode ficar mais barato',
  both: 'pode ficar mais caro ou mais barato',
};

@Component({
  selector: 'app-tier-detail-modal',
  imports: [],
  templateUrl: './tier-detail-modal.html',
  styleUrl: './tier-detail-modal.scss',
})
export class TierDetailModal {
  private auth = inject(AuthService);
  private conversations = inject(ConversationService);

  visible = input(false);
  tier = input<Tier | null>(null);
  close = output<void>();

  user = toSignal(this.auth.currentUser$);
  message = signal('');
  sending = signal(false);
  error = signal('');

  canNegotiate = computed(() => {
    const u = this.user();
    const t = this.tier();
    return !!u && !!t && u.profile_id !== t.profile;
  });

  priceLabel = computed(() => {
    const t = this.tier();
    if (!t) return '';
    return Number(t.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  });

  negotiationLabel = computed(() => {
    const direction = this.tier()?.negotiation_direction;
    return direction ? NEGOTIATION_LABELS[direction] : '';
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.message.set('');
        this.error.set('');
      }
    });
  }

  onMessageInput(event: Event): void {
    this.message.set((event.target as HTMLTextAreaElement).value);
  }

  startNegotiation(): void {
    const t = this.tier();
    if (!t || !this.message().trim() || this.sending()) return;

    this.sending.set(true);
    this.error.set('');

    this.conversations.createConversation(t.id).subscribe({
      next: conversation => {
        this.conversations.sendMessage(conversation.id, this.message().trim()).subscribe({
          next: () => {
            this.sending.set(false);
            this.close.emit();
          },
          error: () => {
            this.sending.set(false);
            this.error.set('Não foi possível enviar a mensagem.');
          },
        });
      },
      error: err => {
        this.sending.set(false);
        const detail = err?.error?.[0] ?? err?.error?.detail ?? 'Não foi possível iniciar a negociação.';
        this.error.set(detail);
      },
    });
  }
}

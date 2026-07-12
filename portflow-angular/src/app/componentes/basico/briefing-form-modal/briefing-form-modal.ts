import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { BriefingService } from '../../../core/services/briefing.service';
import { Briefing } from '../../../core/models/briefing';
import { Tier, NegotiationDirection } from '../../../core/models/tier';
import { ChatAttachment } from '../chat-attachment/chat-attachment';

const NEGOTIATION_LABELS: Record<NegotiationDirection, string> = {
  up: 'pode ficar mais caro',
  down: 'pode ficar mais barato',
  both: 'pode ficar mais caro ou mais barato',
};

function todayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

@Component({
  selector: 'app-briefing-form-modal',
  imports: [ChatAttachment],
  templateUrl: './briefing-form-modal.html',
  styleUrl: './briefing-form-modal.scss',
})
export class BriefingFormModal {
  private briefings = inject(BriefingService);

  visible = input(false);
  conversationId = input<number | null>(null);
  tier = input<Tier | null>(null);

  close = output<void>();
  created = output<Briefing>();

  agreedPrice = signal('');
  requestDetails = signal('');
  requestedDeadline = signal('');
  references = signal<File[]>([]);
  sending = signal(false);
  error = signal('');

  readonly minDate = todayIsoDate();

  negotiationLabel = computed(() => {
    const direction = this.tier()?.negotiation_direction;
    return direction ? NEGOTIATION_LABELS[direction] : '';
  });

  priceLabel = computed(() => {
    const t = this.tier();
    if (!t) return '';
    return Number(t.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.agreedPrice.set(this.tier()?.price ?? '');
        this.requestDetails.set('');
        this.requestedDeadline.set('');
        this.references.set([]);
        this.error.set('');
      }
    });
  }

  onReferencesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    this.references.update(list => [...list, ...files]);
  }

  removeReference(index: number): void {
    this.references.update(list => list.filter((_, i) => i !== index));
  }

  async submit(): Promise<void> {
    const t = this.tier();
    const conversationId = this.conversationId();
    if (!t || !conversationId || this.sending()) return;

    if (!this.requestDetails().trim()) { this.error.set('Descreva os detalhes do pedido.'); return; }
    if (!this.requestedDeadline()) { this.error.set('Escolha um prazo.'); return; }

    const normalizedPrice = t.negotiable ? this.agreedPrice().trim().replace(',', '.') : t.price;
    if (!normalizedPrice || Number.isNaN(Number(normalizedPrice))) { this.error.set('Informe um valor válido.'); return; }
    if (t.negotiable) {
      const numeric = Number(normalizedPrice);
      if (t.negotiation_direction === 'up' && numeric < Number(t.price)) {
        this.error.set('Esta tier só pode ser negociada para mais.');
        return;
      }
      if (t.negotiation_direction === 'down' && numeric > Number(t.price)) {
        this.error.set('Esta tier só pode ser negociada para menos.');
        return;
      }
    }

    this.error.set('');
    this.sending.set(true);
    try {
      const form = new FormData();
      form.append('conversation', String(conversationId));
      form.append('agreed_price', normalizedPrice);
      form.append('request_details', this.requestDetails().trim());
      form.append('requested_deadline', this.requestedDeadline());
      this.references().forEach(file => form.append('references[]', file));

      const briefing = await lastValueFrom(this.briefings.create(form));
      this.created.emit(briefing);
      this.close.emit();
    } catch (e: any) {
      const detail = e?.error;
      if (detail && typeof detail === 'object') {
        const first = Object.values(detail)[0];
        this.error.set(Array.isArray(first) ? (first as string[])[0] : String(first));
      } else {
        this.error.set('Erro ao enviar briefing. Tente novamente.');
      }
    } finally {
      this.sending.set(false);
    }
  }
}

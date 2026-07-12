import { Component, computed, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { BriefingService } from '../../../core/services/briefing.service';
import { Briefing } from '../../../core/models/briefing';
import { Conversation } from '../../../core/models/conversation';
import { ChatAttachment } from '../chat-attachment/chat-attachment';
import { ConfirmActionModal } from '../confirm-action-modal/confirm-action-modal';

const STATUS_LABELS: Record<Briefing['status'], string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  declined: 'Recusado',
};

function formatIsoDatePt(isoDate: string | null): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function formatPrice(value: string | number): string {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

@Component({
  selector: 'app-briefing-detail-modal',
  imports: [ChatAttachment, ConfirmActionModal],
  templateUrl: './briefing-detail-modal.html',
  styleUrl: './briefing-detail-modal.scss',
})
export class BriefingDetailModal {
  private auth = inject(AuthService);
  private briefings = inject(BriefingService);

  visible = input(false);
  briefing = input<Briefing | null>(null);
  conversation = input<Conversation | null>(null);

  close = output<void>();
  responded = output<Briefing>();

  user = toSignal(this.auth.currentUser$);

  showAccept = signal(false);
  showDecline = signal(false);
  declineReason = signal('');
  loading = signal(false);
  error = signal('');

  isArtist = computed(() => this.conversation()?.artist === this.user()?.profile_id);
  canRespond = computed(() => this.isArtist() && this.briefing()?.status === 'pending');
  statusLabel = computed(() => {
    const b = this.briefing();
    return b ? STATUS_LABELS[b.status] : '';
  });
  priceChanged = computed(() => {
    const b = this.briefing();
    return b ? Number(b.agreed_price) !== Number(b.tier_price_snapshot) : false;
  });

  requestedDeadlineLabel = computed(() => formatIsoDatePt(this.briefing()?.requested_deadline ?? null));
  deadlineLabel = computed(() => formatIsoDatePt(this.briefing()?.deadline ?? null));
  agreedPriceLabel = computed(() => formatPrice(this.briefing()?.agreed_price ?? 0));
  tierPriceLabel = computed(() => formatPrice(this.briefing()?.tier_price_snapshot ?? 0));

  acceptMessage = computed(() => {
    const b = this.briefing();
    if (!b) return '';
    return `Você vai aceitar este trabalho por ${formatPrice(b.agreed_price)}, com prazo até ${formatIsoDatePt(b.requested_deadline)}.`;
  });

  openAccept(): void {
    this.error.set('');
    this.showAccept.set(true);
  }

  openDecline(): void {
    this.error.set('');
    this.declineReason.set('');
    this.showDecline.set(true);
  }

  cancelAccept(): void {
    if (this.loading()) return;
    this.showAccept.set(false);
  }

  cancelDecline(): void {
    if (this.loading()) return;
    this.showDecline.set(false);
  }

  async confirmAccept(): Promise<void> {
    const b = this.briefing();
    if (!b || this.loading()) return;
    this.loading.set(true);
    try {
      const updated = await lastValueFrom(this.briefings.accept(b.id));
      this.responded.emit(updated);
      this.showAccept.set(false);
      this.close.emit();
    } catch {
      this.error.set('Não foi possível aceitar o briefing.');
    } finally {
      this.loading.set(false);
    }
  }

  async confirmDecline(): Promise<void> {
    const b = this.briefing();
    if (!b || this.loading()) return;
    this.loading.set(true);
    try {
      const updated = await lastValueFrom(this.briefings.decline(b.id, this.declineReason().trim()));
      this.responded.emit(updated);
      this.showDecline.set(false);
      this.close.emit();
    } catch {
      this.error.set('Não foi possível recusar o briefing.');
    } finally {
      this.loading.set(false);
    }
  }
}

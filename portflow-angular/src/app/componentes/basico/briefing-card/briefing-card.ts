import { Component, computed, input, output } from '@angular/core';
import { Briefing } from '../../../core/models/briefing';

const STATUS_LABELS: Record<Briefing['status'], string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  declined: 'Recusado',
};

@Component({
  selector: 'app-briefing-card',
  imports: [],
  templateUrl: './briefing-card.html',
  styleUrl: './briefing-card.scss',
})
export class BriefingCard {
  briefing = input.required<Briefing>();
  isMine = input(false);
  view = output<void>();

  statusLabel = computed(() => STATUS_LABELS[this.briefing().status]);
}

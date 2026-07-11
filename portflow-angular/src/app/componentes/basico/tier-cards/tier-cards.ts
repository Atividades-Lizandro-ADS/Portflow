import { Component, computed, input } from '@angular/core';
import { Tier, NegotiationDirection } from '../../../core/models/tier';
import { TextSizePipe } from '../../../core/pipes/text-size-pipe';

const NEGOTIATION_LABELS: Record<NegotiationDirection, string> = {
  up: 'pode ficar mais caro',
  down: 'pode ficar mais barato',
  both: 'pode ficar mais caro ou mais barato',
};

@Component({
  selector: 'app-tier-cards',
  imports: [TextSizePipe],
  templateUrl: './tier-cards.html',
  styleUrl: './tier-cards.scss',
})
export class TierCards {
  tier = input.required<Tier>();

  priceLabel = computed(() =>
    Number(this.tier().price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  );

  negotiationLabel = computed(() => {
    const direction = this.tier().negotiation_direction;
    return direction ? NEGOTIATION_LABELS[direction] : '';
  });
}

import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Navbar } from '../../basico/navbar/navbar';
import { TypeSelector } from '../../basico/type-selector/type-selector';
import { ThumbPickerField } from '../../basico/thumb-picker-field/thumb-picker-field';
import { CommissionTier as CommissionTierService } from '../../../core/services/commission-tier';
import { NegotiationDirection } from '../../../core/models/tier';

@Component({
  selector: 'app-comission-tier-form',
  imports: [Navbar, TypeSelector, ThumbPickerField],
  templateUrl: './comission-tier-form.html',
  styleUrl: './comission-tier-form.scss',
})
export class ComissionTierForm implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tiers = inject(CommissionTierService);

  tierId = signal<number | null>(null);
  isEditMode = computed(() => this.tierId() !== null);

  pageLoading = signal(false);
  saving = signal(false);
  error = signal('');

  name = signal('');
  description = signal('');
  price = signal('');
  negotiable = signal(false);
  negotiationDirection = signal<NegotiationDirection>('both');

  currentThumb = signal<string | null>(null);
  thumbFile = signal<File | null>(null);
  thumbPreview = signal<string | null>(null);

  readonly negotiationOptions = [
    { value: 'up', label: 'Só pra cima' },
    { value: 'down', label: 'Só pra baixo' },
    { value: 'both', label: 'Os dois lados' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.tierId.set(+id);
    this.pageLoading.set(true);
    this.tiers.get(id).subscribe({
      next: tier => {
        this.name.set(tier.name ?? '');
        this.description.set(tier.description ?? '');
        this.price.set(tier.price ?? '');
        this.negotiable.set(tier.negotiable ?? false);
        this.negotiationDirection.set(tier.negotiation_direction ?? 'both');
        this.currentThumb.set(tier.thumb ?? null);
        this.thumbPreview.set(tier.thumb ?? null);
        this.pageLoading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar o tier.');
        this.pageLoading.set(false);
      },
    });
  }

  onThumbPicked(file: File): void {
    const old = this.thumbPreview();
    if (old && old !== this.currentThumb()) URL.revokeObjectURL(old);
    this.thumbFile.set(file);
    this.thumbPreview.set(URL.createObjectURL(file));
  }

  setNegotiationDirection(value: string): void {
    this.negotiationDirection.set(value as NegotiationDirection);
  }

  async submit(): Promise<void> {
    if (!this.name().trim()) { this.error.set('O nome do tier é obrigatório.'); return; }
    if (!this.description().trim()) { this.error.set('A descrição é obrigatória.'); return; }
    const normalizedPrice = this.price().trim().replace(',', '.');
    if (!normalizedPrice || Number.isNaN(Number(normalizedPrice))) { this.error.set('Informe um preço válido.'); return; }

    this.error.set('');
    this.saving.set(true);

    try {
      const form = new FormData();
      form.append('name', this.name().trim());
      form.append('description', this.description().trim());
      form.append('price', normalizedPrice);
      form.append('negotiable', this.negotiable() ? 'true' : 'false');
      if (this.negotiable()) form.append('negotiation_direction', this.negotiationDirection());
      if (this.thumbFile()) form.append('thumb', this.thumbFile()!);

      const obs = this.isEditMode()
        ? this.tiers.update(this.tierId()!, form)
        : this.tiers.create(form);

      await lastValueFrom(obs);
      this.router.navigate(['/comissions']);
    } catch (e: any) {
      const detail = e?.error;
      if (detail && typeof detail === 'object') {
        const first = Object.values(detail)[0];
        this.error.set(Array.isArray(first) ? (first as string[])[0] : String(first));
      } else {
        this.error.set('Erro ao salvar o tier. Tente novamente.');
      }
    } finally {
      this.saving.set(false);
    }
  }
}

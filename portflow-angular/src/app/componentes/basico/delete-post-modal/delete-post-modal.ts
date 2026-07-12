import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoPasteInput } from '../no-paste-input/no-paste-input';

@Component({
  selector: 'app-delete-post-modal',
  imports: [FormsModule, NoPasteInput],
  templateUrl: './delete-post-modal.html',
  styleUrl: './delete-post-modal.scss',
})
export class DeletePostModal {
  visible = input(false);
  itemName = input('');
  loading = input(false);
  title = input('Excluir post');
  message = input(
    'Esta ação não pode ser desfeita. Todos os likes, comentários e imagens ligados a este post serão excluídos permanentemente.'
  );
  confirmLabel = input('Eu entendo, apagar post');

  cancel = output<void>();
  confirm = output<void>();

  confirmText = signal('');
  canConfirm = computed(() => this.confirmText() === this.itemName());

  constructor() {
    effect(() => {
      if (this.visible()) this.confirmText.set('');
    });
  }

  onCancel(): void {
    if (this.loading()) return;
    this.cancel.emit();
  }

  onConfirm(): void {
    if (!this.canConfirm() || this.loading()) return;
    this.confirm.emit();
  }
}

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
  postTitle = input('');
  loading = input(false);

  cancel = output<void>();
  confirm = output<void>();

  confirmText = signal('');
  canConfirm = computed(() => this.confirmText() === this.postTitle());

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

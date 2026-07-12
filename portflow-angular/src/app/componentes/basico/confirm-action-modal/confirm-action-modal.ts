import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-action-modal',
  imports: [],
  templateUrl: './confirm-action-modal.html',
  styleUrl: './confirm-action-modal.scss',
})
export class ConfirmActionModal {
  visible = input(false);
  title = input('');
  message = input('');
  confirmLabel = input('Confirmar');
  cancelLabel = input('Cancelar');
  tone = input<'accent' | 'danger'>('accent');
  loading = input(false);

  cancel = output<void>();
  confirm = output<void>();

  onCancel(): void {
    if (this.loading()) return;
    this.cancel.emit();
  }

  onConfirm(): void {
    if (this.loading()) return;
    this.confirm.emit();
  }
}

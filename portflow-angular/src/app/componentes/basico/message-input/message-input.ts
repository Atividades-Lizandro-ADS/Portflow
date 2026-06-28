import { Component, computed, effect, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-message-input',
  imports: [],
  templateUrl: './message-input.html',
  styleUrl: './message-input.scss',
})
export class MessageInput {
  placeholder = input('Adicionar mensagem...');
  loading = input(false);
  prefill = input('');

  sent = output<string>();

  text = signal('');
  canSend = computed(() => this.text().trim().length > 0 && !this.loading());

  constructor() {
    effect(() => { this.text.set(this.prefill()); });
  }

  send(): void {
    const t = this.text().trim();
    if (!t || this.loading()) return;
    this.sent.emit(t);
    this.text.set('');
  }
}

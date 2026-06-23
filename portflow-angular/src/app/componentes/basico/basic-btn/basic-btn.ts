import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-basic-btn',
  imports: [],
  templateUrl: './basic-btn.html',
  styleUrl: './basic-btn.scss',
})
export class BasicBtn {
  label = input('');
  loading = input(false);
  disabled = input(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  clicked = output<void>();

  onClick(): void {
    if (!this.loading() && !this.disabled()) {
      this.clicked.emit();
    }
  }
}

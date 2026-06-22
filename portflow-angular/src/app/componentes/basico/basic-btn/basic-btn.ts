import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-basic-btn',
  imports: [],
  templateUrl: './basic-btn.html',
  styleUrl: './basic-btn.scss',
})
export class BasicBtn {
  @Input() label = '';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.loading && !this.disabled) {
      this.clicked.emit();
    }
  }
}

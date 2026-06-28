import { Component, OnInit, inject, input, signal } from '@angular/core';
import { ToggleableService } from '../../../core/services/toggleable.service';

@Component({
  selector: 'app-toggle-btn',
  imports: [],
  templateUrl: './toggle-btn.html',
  styleUrl: './toggle-btn.scss',
})
export class ToggleBtn implements OnInit {
  active = input(false);
  endpoint = input('');
  iconOn = input('');
  iconOff = input('');

  private toggleable = inject(ToggleableService);

  state = signal(false);
  loading = signal(false);

  ngOnInit(): void {
    this.state.set(this.active());
  }

  toggle(): void {
    if (this.loading()) return;

    const prev = this.state();
    this.state.set(!prev);
    this.loading.set(true);

    this.toggleable.toggle(this.endpoint()).subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.state.set(prev);
        this.loading.set(false);
      },
    });
  }
}

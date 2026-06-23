import { Component, OnInit, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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

  private http = inject(HttpClient);

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

    this.http.post(`${environment.apiUrl}${this.endpoint()}`, {}).subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.state.set(prev);
        this.loading.set(false);
      },
    });
  }
}

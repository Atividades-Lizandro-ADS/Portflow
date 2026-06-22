import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-toggle-btn',
  imports: [],
  templateUrl: './toggle-btn.html',
  styleUrl: './toggle-btn.scss',
})
export class ToggleBtn implements OnInit {
  @Input() active = false;
  @Input() endpoint = '';
  @Input() iconOn = '';
  @Input() iconOff = '';

  private http = inject(HttpClient);

  state = signal(false);
  loading = signal(false);

  ngOnInit() {
    this.state.set(this.active);
  }

  toggle() {
    if (this.loading()) return;

    const prev = this.state();
    this.state.set(!prev);
    this.loading.set(true);

    this.http.post(`${environment.apiUrl}${this.endpoint}`, {}).subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.state.set(prev);
        this.loading.set(false);
      },
    });
  }
}

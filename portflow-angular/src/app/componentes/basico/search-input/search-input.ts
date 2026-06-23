import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-input',
  imports: [],
  templateUrl: './search-input.html',
  styleUrl: './search-input.scss',
})
export class SearchInput {
  private router = inject(Router);

  query = signal('');

  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onSubmit(): void {
    const q = this.query().trim();
    if (q) {
      this.router.navigate(['/search'], { queryParams: { q } });
    }
  }
}

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-input',
  imports: [],
  templateUrl: './search-input.html',
  styleUrl: './search-input.scss',
})
export class SearchInput {
  private router = inject(Router);

  query = '';

  onInput(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
  }

  onSubmit(): void {
    const q = this.query.trim();
    if (q) {
      this.router.navigate(['/search'], { queryParams: { q } });
    }
  }
}

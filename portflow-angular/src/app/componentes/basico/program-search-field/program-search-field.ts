import { Component, inject, input, output, signal } from '@angular/core';
import { ProgramService } from '../../../core/services/program.service';
import { Program } from '../../../core/models/post';

@Component({
  selector: 'app-program-search-field',
  imports: [],
  templateUrl: './program-search-field.html',
  styleUrl: './program-search-field.scss',
})
export class ProgramSearchField {
  private programService = inject(ProgramService);

  selected = input.required<Program[]>();
  added = output<Program>();
  removed = output<number>();

  search = signal('');
  results = signal<Program[]>([]);
  searching = signal(false);
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  onSearch(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.search.set(text);
    this.results.set([]);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (!text.trim()) { this.searching.set(false); return; }
    this.searching.set(true);
    this.debounceTimer = setTimeout(() => {
      this.programService.list(text.trim()).subscribe({
        next: res => {
          const selectedIds = this.selected().map(p => p.id);
          this.results.set(res.results.filter(p => !selectedIds.includes(p.id)));
          this.searching.set(false);
        },
        error: () => this.searching.set(false),
      });
    }, 500);
  }

  add(program: Program): void {
    this.added.emit(program);
    this.results.set([]);
    this.search.set('');
  }

  remove(id: number): void {
    this.removed.emit(id);
  }
}

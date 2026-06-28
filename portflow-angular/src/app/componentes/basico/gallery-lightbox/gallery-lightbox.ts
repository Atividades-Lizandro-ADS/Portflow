import { Component, HostListener, computed, input, output } from '@angular/core';
import { PostImage } from '../../../core/models/post';

@Component({
  selector: 'app-gallery-lightbox',
  imports: [],
  templateUrl: './gallery-lightbox.html',
  styleUrl: './gallery-lightbox.scss',
})
export class GalleryLightbox {
  images = input.required<PostImage[]>();
  index = input<number | null>(null);

  close = output<void>();
  navigate = output<number>();

  isOpen = computed(() => this.index() !== null);
  current = computed(() => {
    const i = this.index();
    return i !== null ? this.images()[i] ?? null : null;
  });
  hasPrev = computed(() => (this.index() ?? 0) > 0);
  hasNext = computed(() => {
    const i = this.index();
    return i !== null && i < this.images().length - 1;
  });
  counter = computed(() => {
    const i = this.index();
    return i !== null ? `${i + 1} / ${this.images().length}` : '';
  });

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (!this.isOpen()) return;
    if (e.key === 'Escape') { this.close.emit(); return; }
    if (e.key === 'ArrowLeft' && this.hasPrev()) this.navigate.emit((this.index() ?? 0) - 1);
    if (e.key === 'ArrowRight' && this.hasNext()) this.navigate.emit((this.index() ?? 0) + 1);
  }
}

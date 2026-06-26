import { Component, ElementRef, HostListener, inject, output, signal } from '@angular/core';

@Component({
  selector: 'app-popover',
  imports: [],
  templateUrl: './popover.html',
  styleUrl: './popover.scss',
})
export class Popover {
  private el = inject(ElementRef);

  open = signal(false);
  opened = output<void>();

  toggle(): void {
    const next = !this.open();
    this.open.set(next);
    if (next) this.opened.emit();
  }

  close(): void {
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}

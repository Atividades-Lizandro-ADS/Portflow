import { Component, input, output } from '@angular/core';
import { CELL_OPTIONS, CellSize, GalleryFormImage } from '../../../core/models/post';

@Component({
  selector: 'app-gallery-image-card',
  imports: [],
  templateUrl: './gallery-image-card.html',
  styleUrl: './gallery-image-card.scss',
})
export class GalleryImageCard {
  image = input.required<GalleryFormImage>();
  showCellSizes = input(false);

  removed = output<void>();
  changed = output<Partial<GalleryFormImage>>();

  readonly cellOptions = CELL_OPTIONS;

  setCell(field: 'cell_size_x' | 'cell_size_y', value: CellSize): void {
    this.changed.emit({ [field]: value });
  }
}

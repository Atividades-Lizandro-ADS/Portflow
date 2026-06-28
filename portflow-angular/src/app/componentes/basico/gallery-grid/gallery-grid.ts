import { Component, input, output } from '@angular/core';
import { PostImage } from '../../../core/models/post';
import { GalleryImage } from '../gallery-image/gallery-image';

const SPAN_MAP: Record<string, number> = { '1/3': 1, '2/3': 2, '3/3': 3 };

@Component({
  selector: 'app-gallery-grid',
  imports: [GalleryImage],
  templateUrl: './gallery-grid.html',
  styleUrl: './gallery-grid.scss',
})
export class GalleryGrid {
  images = input.required<PostImage[]>();
  postIsMature = input(false);
  imageSelect = output<number>();

  colSpan(img: PostImage): number {
    return SPAN_MAP[img.cell_size_x] ?? 1;
  }

  rowSpan(img: PostImage): number {
    return SPAN_MAP[img.cell_size_y] ?? 1;
  }
}

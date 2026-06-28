import { Component, input, output } from '@angular/core';
import { PostImage } from '../../../core/models/post';
import { GalleryImage } from '../gallery-image/gallery-image';

@Component({
  selector: 'app-gallery-list',
  imports: [GalleryImage],
  templateUrl: './gallery-list.html',
  styleUrl: './gallery-list.scss',
})
export class GalleryList {
  images = input.required<PostImage[]>();
  postIsMature = input(false);
  imageSelect = output<number>();
}

import { Component, input, signal } from '@angular/core';
import { PostImage } from '../../../core/models/post';
import { GalleryGrid } from '../gallery-grid/gallery-grid';
import { GalleryList } from '../gallery-list/gallery-list';
import { GalleryLightbox } from '../gallery-lightbox/gallery-lightbox';

@Component({
  selector: 'app-post-gallery',
  imports: [GalleryGrid, GalleryList, GalleryLightbox],
  templateUrl: './post-gallery.html',
  styleUrl: './post-gallery.scss',
})
export class PostGallery {
  images = input.required<PostImage[]>();
  displayType = input<'list' | 'album'>('list');
  postIsMature = input(false);

  activeIndex = signal<number | null>(null);
}

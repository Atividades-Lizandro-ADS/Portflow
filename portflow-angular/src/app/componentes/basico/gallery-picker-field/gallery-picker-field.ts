import { Component, input, output, signal } from '@angular/core';
import { GalleryImageCard } from '../gallery-image-card/gallery-image-card';
import { GalleryFormImage } from '../../../core/models/post';

@Component({
  selector: 'app-gallery-picker-field',
  imports: [GalleryImageCard],
  templateUrl: './gallery-picker-field.html',
  styleUrl: './gallery-picker-field.scss',
})
export class GalleryPickerField {
  showCellSizes = input(false);
  imagesChange = output<GalleryFormImage[]>();

  images = signal<GalleryFormImage[]>([]);

  open(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onFilesChange(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    (event.target as HTMLInputElement).value = '';
    if (!files.length) return;
    const added: GalleryFormImage[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      caption: '',
      acessibilityCaption: '',
      cell_size_x: '1/3',
      cell_size_y: '1/3',
      is_mature: false,
    }));
    this.images.update(imgs => [...imgs, ...added]);
    this.imagesChange.emit(this.images());
  }

  onChanged(index: number, patch: Partial<GalleryFormImage>): void {
    this.images.update(imgs => imgs.map((img, i) => i === index ? { ...img, ...patch } : img));
    this.imagesChange.emit(this.images());
  }

  onRemoved(index: number): void {
    URL.revokeObjectURL(this.images()[index].preview);
    this.images.update(imgs => imgs.filter((_, i) => i !== index));
    this.imagesChange.emit(this.images());
  }
}

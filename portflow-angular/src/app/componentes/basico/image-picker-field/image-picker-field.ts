import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-image-picker-field',
  imports: [],
  templateUrl: './image-picker-field.html',
  styleUrl: './image-picker-field.scss',
})
export class ImagePickerField {
  preview = input<string | null>(null);
  shape = input<'circle' | 'banner'>('banner');
  size = input(80);

  picked = output<File>();

  open(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    (event.target as HTMLInputElement).value = '';
    if (file) this.picked.emit(file);
  }
}

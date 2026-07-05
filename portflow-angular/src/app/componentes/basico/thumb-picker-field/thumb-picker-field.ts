import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-thumb-picker-field',
  imports: [],
  templateUrl: './thumb-picker-field.html',
  styleUrl: './thumb-picker-field.scss',
})
export class ThumbPickerField {
  preview = input<string | null>(null);
  showEditOverlay = input(false);

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

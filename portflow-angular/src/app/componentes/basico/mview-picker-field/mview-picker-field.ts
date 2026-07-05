import { Component, computed, input, output, signal } from '@angular/core';

const MAX_BYTES = 30 * 1024 * 1024;

@Component({
  selector: 'app-mview-picker-field',
  imports: [],
  templateUrl: './mview-picker-field.html',
  styleUrl: './mview-picker-field.scss',
})
export class MviewPickerField {
  current = input<string | null>(null);

  picked = output<File>();
  removed = output<void>();

  pickedFile = signal<File | null>(null);
  error = signal('');

  hasFile = computed(() => !!this.pickedFile() || !!this.current());
  label = computed(() => {
    if (this.pickedFile()) return this.pickedFile()!.name;
    if (this.current()) return 'Arquivo atual (clique para trocar)';
    return 'Selecionar arquivo .mview';
  });

  open(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    (event.target as HTMLInputElement).value = '';
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.mview')) {
      this.error.set('Selecione um arquivo .mview exportado pelo Marmoset Toolbag.');
      return;
    }
    if (file.size > MAX_BYTES) {
      this.error.set('O arquivo não pode ultrapassar 30 MB.');
      return;
    }
    this.error.set('');
    this.pickedFile.set(file);
    this.picked.emit(file);
  }

  removePicked(): void {
    this.pickedFile.set(null);
    this.error.set('');
    this.removed.emit();
  }
}

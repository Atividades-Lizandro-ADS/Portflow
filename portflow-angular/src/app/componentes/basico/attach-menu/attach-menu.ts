import { Component, input, output, viewChild } from '@angular/core';
import { Popover } from '../popover/popover';

@Component({
  selector: 'app-attach-menu',
  imports: [Popover],
  templateUrl: './attach-menu.html',
  styleUrl: './attach-menu.scss',
})
export class AttachMenu {
  isClient = input(false);
  messagingDisabled = input(false);
  briefingDisabled = input(false);

  pickImage = output<File>();
  pickFile = output<File>();
  openBriefing = output<void>();

  private popover = viewChild.required<Popover>('popoverRef');

  onImageSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    target.value = '';
    this.popover().close();
    if (file) this.pickImage.emit(file);
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    target.value = '';
    this.popover().close();
    if (file) this.pickFile.emit(file);
  }

  onOpenBriefing(): void {
    this.popover().close();
    this.openBriefing.emit();
  }
}

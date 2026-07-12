import { Component, DestroyRef, computed, effect, inject, input, output, signal, untracked } from '@angular/core';

export interface AttachmentFile {
  file: string;
  original_filename: string;
  file_size: number;
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

function isImageFilename(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext ?? '');
}

function formatFileSize(bytes: number): string {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

@Component({
  selector: 'app-chat-attachment',
  imports: [],
  templateUrl: './chat-attachment.html',
  styleUrl: './chat-attachment.scss',
})
export class ChatAttachment {
  private destroyRef = inject(DestroyRef);

  attachment = input<AttachmentFile | null>(null);
  pendingFile = input<File | null>(null);
  removable = input(false);

  remove = output<void>();
  openImage = output<void>();

  private objectUrl = signal<string | null>(null);

  constructor() {
    effect(() => {
      const file = this.pendingFile();
      const previous = untracked(() => this.objectUrl());
      if (previous) URL.revokeObjectURL(previous);
      this.objectUrl.set(file ? URL.createObjectURL(file) : null);
    });

    this.destroyRef.onDestroy(() => {
      const url = this.objectUrl();
      if (url) URL.revokeObjectURL(url);
    });
  }

  name = computed(() => this.attachment()?.original_filename ?? this.pendingFile()?.name ?? '');
  size = computed(() => this.attachment()?.file_size ?? this.pendingFile()?.size ?? 0);
  sizeLabel = computed(() => formatFileSize(this.size()));
  previewUrl = computed(() => this.attachment()?.file ?? this.objectUrl() ?? '');
  isImage = computed(() => isImageFilename(this.name()));
}

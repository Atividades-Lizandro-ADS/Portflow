import { Component, computed, input, output, signal } from '@angular/core';
import { ChatMessage } from '../../../core/models/conversation';
import { ChatAttachment as ChatAttachmentModel } from '../../../core/models/chat-attachment';
import { PostImage } from '../../../core/models/post';
import { ChatAttachment } from '../chat-attachment/chat-attachment';
import { BriefingCard } from '../briefing-card/briefing-card';
import { GalleryLightbox } from '../gallery-lightbox/gallery-lightbox';

@Component({
  selector: 'app-chat-bubble',
  imports: [ChatAttachment, BriefingCard, GalleryLightbox],
  templateUrl: './chat-bubble.html',
  styleUrl: './chat-bubble.scss',
})
export class ChatBubble {
  message = input.required<ChatMessage>();
  isMine = input(false);

  openBriefing = output<void>();

  private activeImage = signal<ChatAttachmentModel | null>(null);

  isBriefingMessage = computed(() => {
    const type = this.message().message_type;
    return type === 'briefing_sent' || type === 'briefing_response';
  });

  lightboxImages = computed<PostImage[]>(() => {
    const img = this.activeImage();
    return img ? [{ post_img: img.file, acessibility_caption: img.original_filename } as PostImage] : [];
  });

  lightboxIndex = computed(() => (this.activeImage() ? 0 : null));

  timeLabel = computed(() => {
    const date = new Date(this.message().created_at);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  });

  onOpenImage(attachment: ChatAttachmentModel): void {
    this.activeImage.set(attachment);
  }

  onCloseImage(): void {
    this.activeImage.set(null);
  }
}

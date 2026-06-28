import { Component, computed, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CommentService } from '../../../core/services/comment.service';
import { Comment } from '../../../core/models/post';
import { Avatar } from '../avatar/avatar';

@Component({
  selector: 'app-comment-item',
  imports: [Avatar, DatePipe],
  templateUrl: './comment-item.html',
  styleUrl: './comment-item.scss',
})
export class CommentItem {
  private auth = inject(AuthService);
  private commentService = inject(CommentService);

  comment = input.required<Comment>();
  editRequested = output<Comment>();
  deleted = output<number>();

  user = toSignal(this.auth.currentUser$);
  confirmingDelete = signal(false);
  deleting = signal(false);

  isOwner = computed(() => this.user()?.profile_id === this.comment().comment_owner.id);

  requestDelete(): void {
    this.confirmingDelete.set(true);
  }

  cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  confirmDelete(): void {
    if (this.deleting()) return;
    this.deleting.set(true);
    this.commentService.delete(this.comment().id).subscribe({
      next: () => this.deleted.emit(this.comment().id),
      error: () => { this.deleting.set(false); this.confirmingDelete.set(false); },
    });
  }
}

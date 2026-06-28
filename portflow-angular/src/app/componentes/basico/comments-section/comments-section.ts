import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CommentService } from '../../../core/services/comment.service';
import { Comment } from '../../../core/models/post';
import { CommentItem } from '../comment-item/comment-item';
import { MessageInput } from '../message-input/message-input';

@Component({
  selector: 'app-comments-section',
  imports: [CommentItem, DatePipe, MessageInput],
  templateUrl: './comments-section.html',
  styleUrl: './comments-section.scss',
})
export class CommentsSection implements OnInit {
  private auth = inject(AuthService);
  private commentService = inject(CommentService);

  postId = input.required<number>();

  user = toSignal(this.auth.currentUser$);
  comments = signal<Comment[]>([]);
  editingComment = signal<Comment | null>(null);
  sending = signal(false);
  loading = signal(true);

  editingPrefill = computed(() => this.editingComment()?.comment_text ?? '');

  ngOnInit(): void {
    this.commentService.list(this.postId()).subscribe({
      next: res => { this.comments.set(res.results); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onEditRequested(comment: Comment): void {
    this.editingComment.set(comment);
  }

  cancelEdit(): void {
    this.editingComment.set(null);
  }

  onDeleted(id: number): void {
    this.comments.update(list => list.filter(c => c.id !== id));
  }

  onSent(text: string): void {
    if (this.sending()) return;
    this.sending.set(true);

    const editing = this.editingComment();
    if (editing) {
      this.commentService.update(editing.id, text).subscribe({
        next: updated => {
          this.comments.update(list => list.map(c => (c.id === updated.id ? updated : c)));
          this.editingComment.set(null);
          this.sending.set(false);
        },
        error: () => this.sending.set(false),
      });
    } else {
      this.commentService.create(this.postId(), text).subscribe({
        next: created => {
          this.comments.update(list => [created, ...list]);
          this.sending.set(false);
        },
        error: () => this.sending.set(false),
      });
    }
  }
}

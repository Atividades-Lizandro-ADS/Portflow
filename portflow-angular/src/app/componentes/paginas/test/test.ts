import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToggleBtn } from '../../basico/toggle-btn/toggle-btn';
import { BasicBtn } from '../../basico/basic-btn/basic-btn';
import { TextInput } from '../../basico/text-input/text-input';
import { SearchInput } from '../../basico/search-input/search-input';
import { PostCard } from '../../basico/post-card/post-card';
import { Marmoviewer } from '../../basico/marmoviewer/marmoviewer';
import { NotificationPanel } from '../../basico/notification-panel/notification-panel';
import { PostFeed, PostDetail } from '../../../core/models/post';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-test',
  imports: [ToggleBtn, BasicBtn, TextInput, SearchInput, PostCard, Marmoviewer, NotificationPanel],
  templateUrl: './test.html',
  styleUrl: './test.scss',
})
export class Test implements OnInit {
  private http = inject(HttpClient);

  firstPost = signal<PostFeed | null>(null);
  postDetail = signal<PostDetail | null>(null);

  ngOnInit(): void {
    this.http
      .get<{ results: PostFeed[] }>(`${environment.apiUrl}/api/posts/`)
      .subscribe({
        next: res => {
          const first = res.results[0] ?? null;
          this.firstPost.set(first);
          if (first) {
            this.http
              .get<PostDetail>(`${environment.apiUrl}/api/posts/${first.id}/`)
              .subscribe({
                next: detail => this.postDetail.set(detail),
                error: err => console.error('[Test] detail error:', err),
              });
          }
        },
        error: err => console.error('[Test] error:', err),
      });
  }
}

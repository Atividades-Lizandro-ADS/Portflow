import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToggleBtn } from '../../basico/toggle-btn/toggle-btn';
import { BasicBtn } from '../../basico/basic-btn/basic-btn';
import { TextInput } from '../../basico/text-input/text-input';
import { SearchInput } from '../../basico/search-input/search-input';
import { PostCard } from '../../basico/post-card/post-card';
import { PostFeed } from '../../../core/models/post';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-test',
  imports: [ToggleBtn, BasicBtn, TextInput, SearchInput, PostCard],
  templateUrl: './test.html',
  styleUrl: './test.scss',
})
export class Test implements OnInit {
  private http = inject(HttpClient);
  firstPost = signal<PostFeed | null>(null);

  ngOnInit(): void {
    this.http
      .get<{ results: PostFeed[] }>(`${environment.apiUrl}/api/posts/`)
      .subscribe({
        next: res => this.firstPost.set(res.results[0] ?? null),
        error: err => console.error('[Test] error:', err),
      });
  }
}

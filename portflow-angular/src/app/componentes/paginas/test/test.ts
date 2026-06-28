import { Component, OnInit, inject, signal } from '@angular/core';
import { ToggleBtn } from '../../basico/toggle-btn/toggle-btn';
import { BasicBtn } from '../../basico/basic-btn/basic-btn';
import { TextInput } from '../../basico/text-input/text-input';
import { SearchInput } from '../../basico/search-input/search-input';
import { PostCard } from '../../basico/post-card/post-card';
import { Marmoviewer } from '../../basico/marmoviewer/marmoviewer';
import { NotificationPanel } from '../../basico/notification-panel/notification-panel';
import { Navbar } from '../../basico/navbar/navbar';
import { PostGallery } from '../../basico/post-gallery/post-gallery';
import { PostFeed, PostDetail } from '../../../core/models/post';
import { PostService } from '../../../core/services/post.service';

@Component({
  selector: 'app-test',
  imports: [ToggleBtn, BasicBtn, TextInput, SearchInput, PostCard, Marmoviewer, NotificationPanel, Navbar, PostGallery],
  templateUrl: './test.html',
  styleUrl: './test.scss',
})
export class Test implements OnInit {
  private posts = inject(PostService);

  firstPost = signal<PostFeed | null>(null);
  postDetail = signal<PostDetail | null>(null);

  ngOnInit(): void {
    this.posts.list().subscribe({
      next: res => {
        const first = res.results[0] ?? null;
        this.firstPost.set(first);
        if (first) {
          this.posts.get(first.id).subscribe({
            next: detail => this.postDetail.set(detail),
          });
        }
      },
    });
  }
}

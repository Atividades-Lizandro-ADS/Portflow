import {
  Component, DestroyRef, ElementRef, inject, signal, viewChild, afterNextRender,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../basico/navbar/navbar';
import { PostCard } from '../../basico/post-card/post-card';
import { PostFeed } from '../../../core/models/post';
import { environment } from '../../../../environments/environment';

interface PostPage {
  results: PostFeed[];
  next: string | null;
}

@Component({
  selector: 'app-feed',
  imports: [Navbar, PostCard],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
})
export class Feed {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private sentinel = viewChild.required<ElementRef<HTMLDivElement>>('sentinel');
  private observer!: IntersectionObserver;
  private page = 1;

  posts = signal<PostFeed[]>([]);
  loading = signal(false);
  hasMore = signal(true);

  constructor() {
    this.fetchPosts();

    afterNextRender(() => {
      this.observer = new IntersectionObserver(
        entries => { if (entries[0].isIntersecting) this.loadMore(); },
        { threshold: 0.1 },
      );
      this.observer.observe(this.sentinel().nativeElement);
      this.destroyRef.onDestroy(() => this.observer.disconnect());
    });
  }

  private loadMore(): void {
    if (this.loading() || !this.hasMore()) return;
    this.fetchPosts();
  }

  private fetchPosts(): void {
    this.loading.set(true);
    this.http
      .get<PostPage>(`${environment.apiUrl}/api/posts/`, { params: { page: this.page } })
      .subscribe({
        next: res => {
          this.posts.update(prev => [...prev, ...res.results]);
          this.hasMore.set(!!res.next);
          this.page++;
          this.loading.set(false);
        },
        error: () => {
          this.hasMore.set(false);
          this.loading.set(false);
        },
      });
  }
}

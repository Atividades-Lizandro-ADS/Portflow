import {
  Component, DestroyRef, ElementRef, Injector, inject, signal, viewChild, afterNextRender,
} from '@angular/core';
import { Navbar } from '../../basico/navbar/navbar';
import { PostCard } from '../../basico/post-card/post-card';
import { PostFeed } from '../../../core/models/post';
import { PostService } from '../../../core/services/post.service';

@Component({
  selector: 'app-feed',
  imports: [Navbar, PostCard],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
})
export class Feed {
  private posts$ = inject(PostService);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);
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
    this.posts$.list({ page: this.page }).subscribe({
      next: res => {
        this.posts.update(prev => [...prev, ...res.results]);
        this.hasMore.set(!!res.next);
        this.page++;
        this.loading.set(false);
        afterNextRender(() => this.loadMoreIfSentinelVisible(), { injector: this.injector });
      },
      error: () => {
        this.hasMore.set(false);
        this.loading.set(false);
      },
    });
  }

  private loadMoreIfSentinelVisible(): void {
    if (this.loading() || !this.hasMore()) return;
    const rect = this.sentinel().nativeElement.getBoundingClientRect();
    if (rect.top <= window.innerHeight) this.loadMore();
  }
}

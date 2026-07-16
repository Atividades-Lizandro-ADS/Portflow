import {
  Component, DestroyRef, ElementRef, Injector, inject, signal, viewChild, afterNextRender, effect,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Navbar } from '../../basico/navbar/navbar';
import { PostCard } from '../../basico/post-card/post-card';
import { Avatar } from '../../basico/avatar/avatar';
import { PostFeed } from '../../../core/models/post';
import { ProfileMinimal } from '../../../core/models/profile';
import { PostService } from '../../../core/services/post.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-search',
  imports: [RouterLink, Navbar, PostCard, Avatar],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  private route = inject(ActivatedRoute);
  private postsApi = inject(PostService);
  private profilesApi = inject(ProfileService);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);
  private sentinel = viewChild<ElementRef<HTMLDivElement>>('sentinel');
  private observer?: IntersectionObserver;

  private queryParamMap = toSignal(this.route.queryParamMap);

  private currentQuery = '';
  private profilePage = 1;
  private postPage = 1;

  hasSearched = signal(false);

  profiles = signal<ProfileMinimal[]>([]);
  hasMoreProfiles = signal(false);
  loadingProfiles = signal(false);
  loadingMoreProfiles = signal(false);

  posts = signal<PostFeed[]>([]);
  hasMorePosts = signal(false);
  loadingPosts = signal(false);

  constructor() {
    effect(() => {
      const q = this.queryParamMap()?.get('q')?.trim() ?? '';
      if (q) this.runSearch(q);
    });

    afterNextRender(() => {
      this.observer = new IntersectionObserver(
        entries => { if (entries[0].isIntersecting) this.loadMorePosts(); },
        { threshold: 0.1 },
      );
      const el = this.sentinel()?.nativeElement;
      if (el) this.observer.observe(el);
      this.destroyRef.onDestroy(() => this.observer?.disconnect());
    });
  }

  private runSearch(query: string): void {
    if (query === this.currentQuery) return;
    this.currentQuery = query;
    this.hasSearched.set(true);

    this.profilePage = 1;
    this.profiles.set([]);
    this.loadingProfiles.set(true);
    this.profilesApi.search(query, 1).subscribe({
      next: res => {
        this.profiles.set(res.results);
        this.hasMoreProfiles.set(!!res.next);
        this.loadingProfiles.set(false);
      },
      error: () => this.loadingProfiles.set(false),
    });

    this.postPage = 1;
    this.posts.set([]);
    this.loadingPosts.set(true);
    this.postsApi.list({ page: 1, search: query }).subscribe({
      next: res => {
        this.posts.set(res.results);
        this.hasMorePosts.set(!!res.next);
        this.loadingPosts.set(false);
        afterNextRender(() => this.loadMorePostsIfSentinelVisible(), { injector: this.injector });
      },
      error: () => this.loadingPosts.set(false),
    });
  }

  loadMoreProfiles(): void {
    if (!this.hasMoreProfiles() || this.loadingMoreProfiles() || !this.currentQuery) return;
    this.loadingMoreProfiles.set(true);
    const next = this.profilePage + 1;
    this.profilesApi.search(this.currentQuery, next).subscribe({
      next: res => {
        this.profiles.update(prev => [...prev, ...res.results]);
        this.hasMoreProfiles.set(!!res.next);
        this.profilePage = next;
        this.loadingMoreProfiles.set(false);
      },
      error: () => this.loadingMoreProfiles.set(false),
    });
  }

  private loadMorePosts(): void {
    if (!this.hasMorePosts() || this.loadingPosts() || !this.currentQuery) return;
    this.loadingPosts.set(true);
    const next = this.postPage + 1;
    this.postsApi.list({ page: next, search: this.currentQuery }).subscribe({
      next: res => {
        this.posts.update(prev => [...prev, ...res.results]);
        this.hasMorePosts.set(!!res.next);
        this.postPage = next;
        this.loadingPosts.set(false);
        afterNextRender(() => this.loadMorePostsIfSentinelVisible(), { injector: this.injector });
      },
      error: () => this.loadingPosts.set(false),
    });
  }

  private loadMorePostsIfSentinelVisible(): void {
    if (this.loadingPosts() || !this.hasMorePosts()) return;
    const el = this.sentinel()?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight) this.loadMorePosts();
  }
}

import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../core/services/auth.service';
import { PostService } from '../../../core/services/post.service';
import { PostDetail as PostDetailModel } from '../../../core/models/post';
import { Navbar } from '../../basico/navbar/navbar';
import { PostGallery } from '../../basico/post-gallery/post-gallery';
import { Marmoviewer } from '../../basico/marmoviewer/marmoviewer';
import { AuthorCard } from '../../basico/author-card/author-card';
import { ToggleBtn } from '../../basico/toggle-btn/toggle-btn';
import { CommentsSection } from '../../basico/comments-section/comments-section';
import { ProgramChip } from '../../basico/program-chip/program-chip';

@Component({
  selector: 'app-post-detail',
  imports: [RouterLink, Navbar, PostGallery, Marmoviewer, AuthorCard, ToggleBtn, CommentsSection, ProgramChip],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.scss',
})
export class PostDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private posts = inject(PostService);
  private auth = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  private postId = this.route.snapshot.paramMap.get('id');

  user = toSignal(this.auth.currentUser$);
  post = signal<PostDetailModel | null>(null);
  loading = signal(true);
  error = signal('');

  isOwner = computed(() => this.user()?.profile_id === this.post()?.post_owner?.id);

  youtubeUrl = computed<SafeResourceUrl | null>(() => {
    const id = extractYoutubeId(this.post()?.youtube_link ?? null);
    return id ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`) : null;
  });

  sketchfabUrl = computed<SafeResourceUrl | null>(() => {
    const id = extractSketchfabId(this.post()?.sketchfab_link ?? null);
    return id ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://sketchfab.com/models/${id}/embed`) : null;
  });

  ngOnInit(): void {
    if (!this.postId) {
      this.error.set('Post não encontrado.');
      this.loading.set(false);
      return;
    }
    this.posts.get(this.postId).subscribe({
      next: p => { this.post.set(p); this.loading.set(false); },
      error: () => { this.error.set('Erro ao carregar o post.'); this.loading.set(false); },
    });
  }

  deletePost(): void {
    const p = this.post();
    if (!p) return;
    this.posts.delete(p.id).subscribe({
      next: () => this.router.navigate(['/feed']),
    });
  }
}

function extractYoutubeId(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

function extractSketchfabId(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/sketchfab\.com\/(?:models|3d-models)\/([a-zA-Z0-9-]+)/);
  return m?.[1] ?? null;
}

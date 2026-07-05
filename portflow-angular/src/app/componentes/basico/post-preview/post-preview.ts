import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../core/services/auth.service';
import { GalleryFormImage, PostImage, PostOwner, Program } from '../../../core/models/post';
import { PostGallery } from '../post-gallery/post-gallery';
import { AuthorCard } from '../author-card/author-card';
import { ProgramChip } from '../program-chip/program-chip';

@Component({
  selector: 'app-post-preview',
  imports: [PostGallery, AuthorCard, ProgramChip],
  templateUrl: './post-preview.html',
  styleUrl: './post-preview.scss',
})
export class PostPreview {
  private sanitizer = inject(DomSanitizer);
  private auth = inject(AuthService);

  private user = toSignal(this.auth.currentUser$);

  ownerProfile = computed<PostOwner | null>(() => {
    const u = this.user();
    if (!u) return null;
    return {
      id: u.profile_id,
      first_name: u.first_name,
      username: u.username,
      user_picture: u.user_picture,
      commissions_open: false,
    };
  });

  tittle = input('');
  description = input('');
  artType = input<'2' | '3'>('2');
  displayType = input<'list' | 'album'>('list');
  galleryImages = input<GalleryFormImage[]>([]);
  existingImages = input<PostImage[]>([]);
  youtubeLink = input('');
  sketchfabLink = input('');
  selectedPrograms = input<Program[]>([]);
  keywords = input('');
  mviewFile = input<File | null>(null);
  currentMview = input<string | null>(null);

  allImages = computed<PostImage[]>(() => [
    ...this.existingImages(),
    ...this.galleryImages().map((img, i) => ({
      id: -(i + 1),
      post_img: img.preview,
      caption: img.caption,
      acessibility_caption: img.acessibilityCaption,
      cell_size_x: img.cell_size_x,
      cell_size_y: img.cell_size_y,
      is_mature: img.is_mature,
    })),
  ]);

  keywordsList = computed(() =>
    this.keywords().split(/\s+/).map(k => k.replace(/^#/, '')).filter(Boolean)
  );

  youtubeUrl = computed<SafeResourceUrl | null>(() => {
    const id = extractYoutubeId(this.youtubeLink());
    return id ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`) : null;
  });

  sketchfabUrl = computed<SafeResourceUrl | null>(() => {
    const id = extractSketchfabId(this.sketchfabLink());
    return id ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://sketchfab.com/models/${id}/embed`) : null;
  });

  mviewLabel = computed(() => {
    const f = this.mviewFile();
    if (f) return f.name;
    if (this.currentMview()) return 'Arquivo .mview existente';
    return null;
  });
}

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

function extractSketchfabId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/sketchfab\.com\/(?:models|3d-models)\/([a-zA-Z0-9-]+)/);
  return m?.[1] ?? null;
}

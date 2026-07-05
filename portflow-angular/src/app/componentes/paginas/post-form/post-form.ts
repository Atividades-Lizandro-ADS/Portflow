import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { PostService } from '../../../core/services/post.service';
import { PostImageService } from '../../../core/services/post-image.service';
import { GalleryFormImage, PostImage, Program, CellSize, CELL_OPTIONS } from '../../../core/models/post';
import { Navbar } from '../../basico/navbar/navbar';
import { TypeSelector } from '../../basico/type-selector/type-selector';
import { PublishToggle } from '../../basico/publish-toggle/publish-toggle';
import { ProgramSearchField } from '../../basico/program-search-field/program-search-field';
import { ThumbPickerField } from '../../basico/thumb-picker-field/thumb-picker-field';
import { MviewPickerField } from '../../basico/mview-picker-field/mview-picker-field';
import { GalleryPickerField } from '../../basico/gallery-picker-field/gallery-picker-field';
import { PostPreview } from '../../basico/post-preview/post-preview';

interface ExistingImageEdit {
  id: number;
  preview: string;
  caption: string;
  acessibilityCaption: string;
  cell_size_x: CellSize;
  cell_size_y: CellSize;
  is_mature: boolean;
}

@Component({
  selector: 'app-post-form',
  imports: [
    Navbar, TypeSelector, PublishToggle, ProgramSearchField,
    ThumbPickerField, MviewPickerField, GalleryPickerField, PostPreview,
  ],
  templateUrl: './post-form.html',
  styleUrl: './post-form.scss',
})
export class PostForm implements OnInit {
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private posts = inject(PostService);
  private postImages = inject(PostImageService);

  readonly cellOptions = CELL_OPTIONS;

  postId = signal<number | null>(null);
  isEditMode = computed(() => this.postId() !== null);

  mode = signal<'form' | 'preview'>('form');
  pageLoading = signal(false);
  saving = signal(false);
  error = signal('');

  tittle = signal('');
  caption = signal('');
  description = signal('');
  keywords = signal('');
  artType = signal<'2' | '3'>('2');
  displayType = signal<'list' | 'album'>('list');
  published = signal(true);
  isMature = signal(false);
  youtubeLink = signal('');
  sketchfabLink = signal('');
  selectedPrograms = signal<Program[]>([]);

  currentThumb = signal<string | null>(null);
  thumbFile = signal<File | null>(null);
  thumbPreview = signal<string | null>(null);

  currentMview = signal<string | null>(null);
  mviewFile = signal<File | null>(null);

  existingImages = signal<ExistingImageEdit[]>([]);
  removedImageIds = signal<number[]>([]);
  newImages = signal<GalleryFormImage[]>([]);

  existingAsPostImages = computed<PostImage[]>(() =>
    this.existingImages().map(img => ({
      id: img.id,
      post_img: img.preview,
      caption: img.caption,
      acessibility_caption: img.acessibilityCaption,
      cell_size_x: img.cell_size_x,
      cell_size_y: img.cell_size_y,
      is_mature: img.is_mature,
    }))
  );

  readonly artTypeOptions = [
    { value: '2', label: '2D' },
    { value: '3', label: '3D' },
  ];

  readonly displayTypeOptions = [
    { value: 'list', label: 'Lista' },
    { value: 'album', label: 'Album' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.postId.set(+id);
    this.pageLoading.set(true);
    this.posts.get(id).subscribe({
      next: post => {
        this.tittle.set(post.tittle ?? '');
        this.caption.set(post.caption ?? '');
        this.description.set(post.description ?? '');
        this.keywords.set(post.keywords ?? '');
        this.artType.set(post.art_type ?? '2');
        this.displayType.set((post.display_type as 'list' | 'album') ?? 'list');
        this.published.set(post.published ?? true);
        this.isMature.set(post.is_mature ?? false);
        this.youtubeLink.set(post.youtube_link ?? '');
        this.sketchfabLink.set(post.sketchfab_link ?? '');
        this.selectedPrograms.set(post.used_programs ?? []);
        this.currentThumb.set(post.post_thumb ?? null);
        this.thumbPreview.set(post.post_thumb ?? null);
        this.currentMview.set(post.marmoview ?? null);
        this.existingImages.set((post.images ?? []).map(img => ({
          id: img.id,
          preview: img.post_img,
          caption: img.caption ?? '',
          acessibilityCaption: img.acessibility_caption ?? '',
          cell_size_x: (img.cell_size_x as CellSize) ?? '1/3',
          cell_size_y: (img.cell_size_y as CellSize) ?? '1/3',
          is_mature: img.is_mature ?? false,
        })));
        this.pageLoading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar o post.');
        this.pageLoading.set(false);
      },
    });
  }

  onThumbPicked(file: File): void {
    const old = this.thumbPreview();
    if (old && old !== this.currentThumb()) URL.revokeObjectURL(old);
    this.thumbFile.set(file);
    this.thumbPreview.set(URL.createObjectURL(file));
  }

  onMviewPicked(file: File): void {
    this.mviewFile.set(file);
  }

  onMviewRemoved(): void {
    this.mviewFile.set(null);
  }

  onNewImagesChange(images: GalleryFormImage[]): void {
    this.newImages.set(images);
  }

  updateExistingCaption(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.existingImages.update(imgs => imgs.map((img, i) => i === index ? { ...img, caption: value } : img));
  }

  updateExistingMature(index: number, checked: boolean): void {
    this.existingImages.update(imgs => imgs.map((img, i) => i === index ? { ...img, is_mature: checked } : img));
  }

  updateExistingCell(index: number, field: 'cell_size_x' | 'cell_size_y', value: CellSize): void {
    this.existingImages.update(imgs => imgs.map((img, i) => i === index ? { ...img, [field]: value } : img));
  }

  removeExistingImage(index: number): void {
    const id = this.existingImages()[index].id;
    this.removedImageIds.update(ids => [...ids, id]);
    this.existingImages.update(imgs => imgs.filter((_, i) => i !== index));
  }

  addProgram(prog: Program): void {
    this.selectedPrograms.update(list => [...list, prog]);
  }

  removeProgram(id: number): void {
    this.selectedPrograms.update(list => list.filter(p => p.id !== id));
  }

  setArtType(value: string): void {
    this.artType.set(value as '2' | '3');
  }

  setDisplayType(value: string): void {
    this.displayType.set(value as 'list' | 'album');
  }

  async submit(): Promise<void> {
    if (!this.tittle().trim()) { this.error.set('O título é obrigatório.'); return; }
    if (!this.caption().trim()) { this.error.set('A legenda é obrigatória.'); return; }
    if (!this.description().trim()) { this.error.set('A descrição é obrigatória.'); return; }
    if (!this.isEditMode() && !this.thumbFile()) { this.error.set('Selecione uma thumbnail para o post.'); return; }

    this.error.set('');
    this.saving.set(true);

    try {
      if (this.isEditMode()) {
        await Promise.all(this.removedImageIds().map(id => lastValueFrom(this.postImages.delete(id))));
        await Promise.all(this.existingImages().map(img => lastValueFrom(this.postImages.update(img.id, {
          caption: img.caption,
          acessibility_caption: img.acessibilityCaption,
          cell_size_x: img.cell_size_x,
          cell_size_y: img.cell_size_y,
          is_mature: img.is_mature,
        }))));
      }

      const form = new FormData();
      form.append('tittle', this.tittle().trim());
      form.append('caption', this.caption().trim());
      form.append('description', this.description().trim());
      form.append('keywords', this.keywords().trim());
      form.append('art_type', this.artType());
      form.append('display_type', this.displayType());
      form.append('published', this.published() ? 'true' : 'false');
      form.append('is_mature', this.isMature() ? 'true' : 'false');
      if (this.youtubeLink().trim()) form.append('youtube_link', this.youtubeLink().trim());
      if (this.sketchfabLink().trim()) form.append('sketchfab_link', this.sketchfabLink().trim());
      if (this.thumbFile()) form.append('post_thumb', this.thumbFile()!);
      if (this.mviewFile()) form.append('marmoview', this.mviewFile()!);
      this.newImages().forEach(img => {
        form.append('post_img[]', img.file);
        form.append('caption[]', img.caption);
        form.append('acessibility_caption[]', img.acessibilityCaption);
        form.append('cell_size_x[]', img.cell_size_x);
        form.append('cell_size_y[]', img.cell_size_y);
        form.append('is_mature[]', img.is_mature ? 'true' : 'false');
      });
      this.selectedPrograms().forEach(p => form.append('used_programs[]', String(p.id)));

      const obs = this.isEditMode()
        ? this.posts.update(this.postId()!, form)
        : this.posts.create(form);

      const result = await lastValueFrom(obs);
      this.router.navigate(['/post', result.id]);
    } catch (e: any) {
      const detail = e?.error;
      if (detail && typeof detail === 'object') {
        const first = Object.values(detail)[0];
        this.error.set(Array.isArray(first) ? (first as string[])[0] : String(first));
      } else {
        this.error.set('Erro ao salvar. Tente novamente.');
      }
    } finally {
      this.saving.set(false);
    }
  }
}

import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { PostImage } from '../../../core/models/post';

@Component({
  selector: 'app-gallery-image',
  imports: [],
  templateUrl: './gallery-image.html',
  styleUrl: './gallery-image.scss',
})
export class GalleryImage {
  private auth = inject(AuthService);
  private router = inject(Router);

  image = input.required<PostImage>();
  postIsMature = input(false);
  imageClick = output<void>();

  revealed = signal(false);
  isLoggedIn = computed(() => this.auth.isLoggedIn());

  isMature = computed(() => !this.postIsMature() && this.image().is_mature);
  isBlurred = computed(() => this.isMature() && !this.revealed());

  onClick(): void {
    if (!this.isMature() || this.revealed()) {
      this.imageClick.emit();
      return;
    }
    if (this.auth.isLoggedIn()) {
      this.revealed.set(true);
    } else {
      this.router.navigate(['/login']);
    }
  }
}

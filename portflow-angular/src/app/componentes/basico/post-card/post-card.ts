import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostFeed } from '../../../core/models/post';

@Component({
  selector: 'app-post-card',
  imports: [RouterLink],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {
  @Input() post!: PostFeed;
}

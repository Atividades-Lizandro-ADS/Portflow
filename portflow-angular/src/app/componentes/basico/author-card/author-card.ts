import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avatar } from '../avatar/avatar';
import { PostOwner } from '../../../core/models/post';

@Component({
  selector: 'app-author-card',
  imports: [RouterLink, Avatar],
  templateUrl: './author-card.html',
  styleUrl: './author-card.scss',
})
export class AuthorCard {
  profile = input.required<PostOwner>();
}

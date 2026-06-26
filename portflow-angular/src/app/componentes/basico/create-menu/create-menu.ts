import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Popover } from '../popover/popover';

@Component({
  selector: 'app-create-menu',
  imports: [Popover, RouterLink],
  templateUrl: './create-menu.html',
  styleUrl: './create-menu.scss',
})
export class CreateMenu {}

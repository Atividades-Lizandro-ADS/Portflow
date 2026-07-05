import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { SearchInput } from '../search-input/search-input';
import { CreateMenu } from '../create-menu/create-menu';
import { NotificationPanel } from '../notification-panel/notification-panel';
import { UserMenu } from '../user-menu/user-menu';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, SearchInput, CreateMenu, NotificationPanel, UserMenu],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private auth = inject(AuthService);

  user = toSignal(this.auth.currentUser$);
  logoExist = signal(false);
}

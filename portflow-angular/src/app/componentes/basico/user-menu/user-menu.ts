import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Popover } from '../popover/popover';
import { Avatar } from '../avatar/avatar';
import { AuthService } from '../../../core/services/auth';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-menu',
  imports: [Popover, Avatar, RouterLink],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss',
})
export class UserMenu {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = toSignal(this.auth.currentUser$);

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.auth.clearSession();
        this.router.navigate(['/login']);
      },
    });
  }
}

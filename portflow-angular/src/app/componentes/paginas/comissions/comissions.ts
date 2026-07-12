import { Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../basico/navbar/navbar';
import { Switch, SwitchOption } from '../../basico/switch/switch';
import { TierCards } from '../../basico/tier-cards/tier-cards';
import { TierDetailModal } from '../../basico/tier-detail-modal/tier-detail-modal';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { Profile } from '../../../core/models/profile';
import { Tier } from '../../../core/models/tier';

@Component({
  selector: 'app-comissions',
  imports: [Navbar, Switch, TierCards, TierDetailModal, RouterLink],
  templateUrl: './comissions.html',
  styleUrl: './comissions.scss',
})
export class Comissions implements OnInit {
  private auth = inject(AuthService);
  private profiles = inject(ProfileService);

  user = toSignal(this.auth.currentUser$);
  profile = signal<Profile | null>(null);
  loading = signal(true);
  selectedTier = signal<Tier | null>(null);

  tab = signal<'chats' | 'tiers'>('chats');

  tabOptions: SwitchOption[] = [
    { id: 'chats', label: 'Chats' },
    { id: 'tiers', label: 'Tiers' },
  ];

  ngOnInit(): void {
    const id = this.user()?.profile_id;
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.profiles.get(id).subscribe({
      next: p => { this.profile.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onTabChange(id: string): void {
    this.tab.set(id as 'chats' | 'tiers');
  }
}

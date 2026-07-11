import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { Profile as ProfileModel } from '../../../core/models/profile';
import { Navbar } from '../../basico/navbar/navbar';
import { Avatar } from '../../basico/avatar/avatar';
import { PostCard } from '../../basico/post-card/post-card';
import { ProgramChip } from '../../basico/program-chip/program-chip';
import { Switch, SwitchOption } from '../../basico/switch/switch';

@Component({
  selector: 'app-about',
  imports: [RouterLink, Navbar, Avatar, PostCard, ProgramChip, Switch],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit {
  private route = inject(ActivatedRoute);
  private profiles = inject(ProfileService);
  private auth = inject(AuthService);

  private user = toSignal(this.auth.currentUser$);

  profile = signal<ProfileModel | null>(null);
  loading = signal(true);
  error = signal('');
  tab = signal<'portfolio' | 'sobre'>('portfolio');

  tabOptions: SwitchOption[] = [
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'sobre', label: 'Sobre' },
  ];

  isOwner = computed(() => this.user()?.profile_id === this.profile()?.id);

  onTabChange(id: string): void {
    this.tab.set(id as 'portfolio' | 'sobre');
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Perfil não encontrado.');
      this.loading.set(false);
      return;
    }
    this.profiles.get(id).subscribe({
      next: p => { this.profile.set(p); this.loading.set(false); },
      error: () => { this.error.set('Erro ao carregar o perfil.'); this.loading.set(false); },
    });
  }
}

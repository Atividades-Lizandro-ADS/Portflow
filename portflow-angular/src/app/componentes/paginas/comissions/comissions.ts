import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../basico/navbar/navbar';
import { Switch, SwitchOption } from '../../basico/switch/switch';
import { TierCards } from '../../basico/tier-cards/tier-cards';
import { TierDetailModal } from '../../basico/tier-detail-modal/tier-detail-modal';
import { ChatListItem } from '../../basico/chat-list-item/chat-list-item';
import { DeletePostModal } from '../../basico/delete-post-modal/delete-post-modal';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { Conversation as ConversationService } from '../../../core/services/conversation';
import { CommissionTier as CommissionTierService } from '../../../core/services/commission-tier';
import { Profile, ProfileMinimal } from '../../../core/models/profile';
import { Tier } from '../../../core/models/tier';
import { Conversation as ConversationModel } from '../../../core/models/conversation';

interface ChatGroup {
  profile: ProfileMinimal;
  conversations: ConversationModel[];
}

@Component({
  selector: 'app-comissions',
  imports: [Navbar, Switch, TierCards, TierDetailModal, ChatListItem, DeletePostModal, RouterLink],
  templateUrl: './comissions.html',
  styleUrl: './comissions.scss',
})
export class Comissions implements OnInit {
  private auth = inject(AuthService);
  private profiles = inject(ProfileService);
  private conversationsApi = inject(ConversationService);
  private tiersApi = inject(CommissionTierService);
  private router = inject(Router);

  user = toSignal(this.auth.currentUser$);
  profile = signal<Profile | null>(null);
  loading = signal(true);
  selectedTier = signal<Tier | null>(null);
  tierToDelete = signal<Tier | null>(null);
  deletingTier = signal(false);

  conversations = signal<ConversationModel[]>([]);
  selectedGroup = signal<ChatGroup | null>(null);

  tab = signal<'chats' | 'tiers'>('chats');

  tabOptions: SwitchOption[] = [
    { id: 'chats', label: 'Chats' },
    { id: 'tiers', label: 'Tiers' },
  ];

  chatGroups = computed<ChatGroup[]>(() => {
    const groups: ChatGroup[] = [];
    const byProfile = new Map<number, ChatGroup>();
    for (const conversation of this.conversations()) {
      const key = conversation.other_profile.id;
      let group = byProfile.get(key);
      if (!group) {
        group = { profile: conversation.other_profile, conversations: [] };
        byProfile.set(key, group);
        groups.push(group);
      }
      group.conversations.push(conversation);
    }
    return groups;
  });

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
    this.conversationsApi.list().subscribe({
      next: page => this.conversations.set(page.results),
      error: () => {},
    });
  }

  onTabChange(id: string): void {
    this.tab.set(id as 'chats' | 'tiers');
  }

  onGroupClick(group: ChatGroup): void {
    if (group.conversations.length === 1) {
      this.router.navigate(['/chat', group.conversations[0].id]);
    } else {
      this.selectedGroup.set(group);
    }
  }

  onEditTier(tier: Tier): void {
    this.router.navigate(['/comission-tier-form', tier.id]);
  }

  onDeleteTier(tier: Tier): void {
    this.tierToDelete.set(tier);
  }

  cancelDeleteTier(): void {
    if (this.deletingTier()) return;
    this.tierToDelete.set(null);
  }

  confirmDeleteTier(): void {
    const tier = this.tierToDelete();
    if (!tier) return;
    this.deletingTier.set(true);
    this.tiersApi.delete(tier.id).subscribe({
      next: () => {
        this.profile.update(p => p ? {
          ...p,
          commission_tiers: p.commission_tiers.filter(t => t.id !== tier.id),
        } : p);
        this.deletingTier.set(false);
        this.tierToDelete.set(null);
      },
      error: () => this.deletingTier.set(false),
    });
  }
}

import { Component, signal } from '@angular/core';
import { Navbar } from '../../basico/navbar/navbar';
import { Switch, SwitchOption } from '../../basico/switch/switch';

@Component({
  selector: 'app-comissions',
  imports: [Navbar, Switch],
  templateUrl: './comissions.html',
  styleUrl: './comissions.scss',
})
export class Comissions {
  tab = signal<'chats' | 'tiers'>('chats');

  tabOptions: SwitchOption[] = [
    { id: 'chats', label: 'Chats' },
    { id: 'tiers', label: 'Tiers' },
  ];

  onTabChange(id: string): void {
    this.tab.set(id as 'chats' | 'tiers');
  }
}

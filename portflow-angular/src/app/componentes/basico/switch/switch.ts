import { Component, input, output } from '@angular/core';

export interface SwitchOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-switch',
  imports: [],
  templateUrl: './switch.html',
  styleUrl: './switch.scss',
})
export class Switch {
  options = input<SwitchOption[]>([]);
  active = input<string>('');
  change = output<string>();
}

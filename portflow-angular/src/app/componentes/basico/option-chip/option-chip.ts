import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-option-chip',
  imports: [],
  templateUrl: './option-chip.html',
  styleUrl: './option-chip.scss',
})
export class OptionChip {
  label = input.required<string>();
  active = input(false);
  toggle = output<void>();
}

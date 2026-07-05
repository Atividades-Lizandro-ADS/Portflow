import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-type-selector',
  imports: [],
  templateUrl: './type-selector.html',
  styleUrl: './type-selector.scss',
})
export class TypeSelector {
  options = input.required<{ value: string; label: string }[]>();
  value = input.required<string>();
  valueChange = output<string>();
}

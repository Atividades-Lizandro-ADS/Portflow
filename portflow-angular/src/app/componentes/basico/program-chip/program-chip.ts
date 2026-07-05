import { Component, input } from '@angular/core';
import { Program } from '../../../core/models/post';

@Component({
  selector: 'app-program-chip',
  imports: [],
  templateUrl: './program-chip.html',
  styleUrl: './program-chip.scss',
})
export class ProgramChip {
  program = input.required<Program>();
}

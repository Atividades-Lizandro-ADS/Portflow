import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToggleBtn } from './componentes/basico/toggle-btn/toggle-btn';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToggleBtn],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}

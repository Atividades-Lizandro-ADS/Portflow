import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToggleBtn } from './componentes/basico/toggle-btn/toggle-btn';
import { BasicBtn } from './componentes/basico/basic-btn/basic-btn';
import { TextInput } from './componentes/basico/text-input/text-input';
import { SearchInput } from './componentes/basico/search-input/search-input';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToggleBtn, BasicBtn, TextInput, SearchInput],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}

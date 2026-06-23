import { Component } from '@angular/core';
import { ToggleBtn } from '../../basico/toggle-btn/toggle-btn';
import { BasicBtn } from '../../basico/basic-btn/basic-btn';
import { TextInput } from '../../basico/text-input/text-input';
import { SearchInput } from '../../basico/search-input/search-input';

@Component({
  selector: 'app-test',
  imports: [ToggleBtn, BasicBtn, TextInput, SearchInput],
  templateUrl: './test.html',
  styleUrl: './test.scss',
})
export class Test {}

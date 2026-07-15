import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-publish-toggle',
  imports: [],
  templateUrl: './publish-toggle.html',
  styleUrl: './publish-toggle.scss',
})
export class PublishToggle {
  value = input(true);
  label = input('Publicar agora');
  subOn = input('Visível para todos');
  subOff = input('Salvo como rascunho');
  valueChange = output<boolean>();
}

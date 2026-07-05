import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-publish-toggle',
  imports: [],
  templateUrl: './publish-toggle.html',
  styleUrl: './publish-toggle.scss',
})
export class PublishToggle {
  value = input(true);
  valueChange = output<boolean>();
}

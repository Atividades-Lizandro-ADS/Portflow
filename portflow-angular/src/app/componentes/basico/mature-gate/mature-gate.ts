import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-mature-gate',
  imports: [],
  templateUrl: './mature-gate.html',
  styleUrl: './mature-gate.scss',
})
export class MatureGate {
  isLoggedIn = input(false);

  continue = output<void>();
  cancel = output<void>();
  login = output<void>();

  onCancel(): void {
    this.cancel.emit();
  }

  onContinue(): void {
    this.continue.emit();
  }

  onLogin(): void {
    this.login.emit();
  }
}

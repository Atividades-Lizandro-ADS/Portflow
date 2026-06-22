import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-teste',
  imports: [],
  templateUrl: './teste.html',
  styleUrl: './teste.scss',
})
export class Teste {
  private auth = inject(AuthService);
  currentUser = toSignal(this.auth.currentUser$);
}

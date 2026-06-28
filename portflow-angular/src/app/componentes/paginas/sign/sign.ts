import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, filter, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth';
import { BasicBtn } from '../../basico/basic-btn/basic-btn';
import { TextInput } from '../../basico/text-input/text-input';

@Component({
  selector: 'app-sign',
  imports: [ReactiveFormsModule, BasicBtn, TextInput, RouterLink],
  templateUrl: './sign.html',
  styleUrl: './sign.scss',
})
export class Sign {
  private auth = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  form = new FormGroup({
    first_name: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    password2: new FormControl('', Validators.required),
  });

  usernameStatus = signal<'idle' | 'checking' | 'available' | 'taken'>('idle');
  loading = signal(false);
  error = signal('');

  constructor() {
    this.form.get('username')!.valueChanges.pipe(
      tap(v => this.usernameStatus.set(v && v.length >= 3 ? 'checking' : 'idle')),
      debounceTime(500),
      filter(v => !!v && v.length >= 3),
      switchMap(v =>
        this.auth.checkUsername(v!).pipe(
          catchError(() => of<{ available: boolean }>({ available: false }))
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(res => this.usernameStatus.set(res.available ? 'available' : 'taken'));
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    if (this.usernameStatus() === 'taken') {
      this.error.set('Este username já está em uso.');
      return;
    }
    const v = this.form.getRawValue();
    if (v.password !== v.password2) {
      this.error.set('As senhas não coincidem.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.register(v as RegisterRequest).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/feed']);
      },
      error: (e) => {
        const detail = e.error;
        if (detail && typeof detail === 'object') {
          const first = Object.values(detail)[0];
          this.error.set(Array.isArray(first) ? first[0] as string : String(first));
        } else {
          this.error.set('Erro ao criar conta.');
        }
        this.loading.set(false);
      },
    });
  }
}

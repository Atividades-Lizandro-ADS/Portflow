import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { LoginRequest } from '../../../core/models/auth';
import { BasicBtn } from '../../basico/basic-btn/basic-btn';
import { TextInput } from '../../basico/text-input/text-input';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, BasicBtn, TextInput, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  form = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  loading = false;
  error = '';

  submit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.getRawValue() as LoginRequest).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/feed']);
      },
      error: () => {
        this.error = 'Usuário ou senha inválidos.';
        this.loading = false;
      },
    });
  }
}

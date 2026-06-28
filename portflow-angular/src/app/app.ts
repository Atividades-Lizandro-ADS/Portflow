import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private auth = inject(AuthService);

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.auth.me().subscribe();
    }
  }
}

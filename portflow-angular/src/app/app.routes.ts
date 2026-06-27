import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth-guard';
import { Test } from './componentes/paginas/test/test';
import { Login } from './componentes/paginas/login/login';
import { Sign } from './componentes/paginas/sign/sign';
import { Search } from './componentes/paginas/search/search';
import { Feed } from './componentes/paginas/feed/feed';
import { PostDetail } from './componentes/paginas/post-detail/post-detail';

export const routes: Routes = [
  { path: 'feed', component: Feed },
  { path: 'post/:id', component: PostDetail },
  { path: 'test', component: Test },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'sign', component: Sign, canActivate: [guestGuard] },
  { path: 'search', component: Search },
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
];

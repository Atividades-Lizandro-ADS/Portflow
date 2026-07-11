import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth-guard';
import { Test } from './componentes/paginas/test/test';
import { Login } from './componentes/paginas/login/login';
import { Sign } from './componentes/paginas/sign/sign';
import { Search } from './componentes/paginas/search/search';
import { Feed } from './componentes/paginas/feed/feed';
import { PostDetail } from './componentes/paginas/post-detail/post-detail';
import { PostForm } from './componentes/paginas/post-form/post-form';
import { About } from './componentes/paginas/about/about';
import { EditAbout } from './componentes/paginas/edit-about/edit-about';
import { Comissions } from './componentes/paginas/comissions/comissions';

export const routes: Routes = [
  { path: 'feed', component: Feed },
  { path: 'profile/:id', component: About },
  { path: 'comissions', component: Comissions, canActivate: [authGuard] },
  { path: 'edit-about', component: EditAbout, canActivate: [authGuard] },
  { path: 'post/:id', component: PostDetail },
  { path: 'create-post', component: PostForm, canActivate: [authGuard] },
  { path: 'edit-post/:id', component: PostForm, canActivate: [authGuard] },
  { path: 'test', component: Test },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'sign', component: Sign, canActivate: [guestGuard] },
  { path: 'search', component: Search },
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
];

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { Search } from './componentes/paginas/search/search';

export const routes: Routes = [
  { path: 'search', component: Search },
];

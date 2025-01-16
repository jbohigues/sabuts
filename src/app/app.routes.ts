import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';
import { noAuthGuard } from '@guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: '',
    loadChildren: () => import('@routes/main.routes').then((m) => m.routes),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadChildren: () => import('@routes/login.routes').then((m) => m.routes),
    canActivate: [noAuthGuard],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'home',
  },
];

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () => import('./routes/main.routes').then((m) => m.routes),
  },
  {
    path: 'auth',
    loadChildren: () => import('./routes/auth.routes').then((m) => m.routes),
  },
];

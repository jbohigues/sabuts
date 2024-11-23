import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () => import('./routes/main.routes').then((m) => m.routes),
    canActivate: [AuthGuard],
  },
  {
    path: 'auth',
    loadChildren: () => import('./routes/auth.routes').then((m) => m.routes),
    canActivate: [NoAuthGuard],
  },
];

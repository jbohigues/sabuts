import { Routes } from '@angular/router';
import { AuthGuard } from '@guards/auth.guard';
import { NoAuthGuard } from '@guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: '',
    loadChildren: () => import('@routes/main.routes').then((m) => m.routes),
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadChildren: () => import('@routes/login.routes').then((m) => m.routes),
    canActivate: [NoAuthGuard],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'home',
  },  {
    path: 'playing-game',
    loadComponent: () => import('./pages/main/games/pages/playing-game/playing-game.page').then( m => m.PlayingGamePage)
  },

];

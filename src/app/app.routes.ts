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
  // {
  //   path: 'main',
  //   loadComponent: () => import('./pages/main/main.page').then( m => m.MainPage)
  // },
  // {
  //   path: 'home',
  //   loadComponent: () => import('./pages/main/home/home.page').then( m => m.HomePage)
  // },
  // {
  //   path: 'profile',
  //   loadComponent: () => import('./pages/main/profile/profile.page').then( m => m.ProfilePage)
  // },
];

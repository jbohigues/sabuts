import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@pages/main/main.page').then((m) => m.MainPage),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('@pages/main/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'play',
        loadComponent: () =>
          import('@pages/main/play/play.page').then((m) => m.PlayPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('@pages/main/profile/profile.page').then((m) => m.ProfilePage),
      },
    ],
  },
];

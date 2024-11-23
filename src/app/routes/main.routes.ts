import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/main/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../pages/main/profile/profile.page').then(
            (m) => m.ProfilePage
          ),
      },
    ],
  },
];

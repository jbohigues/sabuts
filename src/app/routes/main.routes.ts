import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/home/home.page').then((m) => m.HomePage),
      },
    ],
  },
];

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@layouts/mainLayout/mainLayout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('@pages/main/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'games',
        loadComponent: () =>
          import('@pages/main/games/games.page').then((m) => m.GamesPage),
      },
      {
        path: 'games/:_idgame',
        loadComponent: () =>
          import('@pages/main/games/pages/playing-game/playing-game.page').then(
            (m) => m.PlayingGamePage
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('@pages/main/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];

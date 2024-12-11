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
        path: 'profile',
        loadComponent: () =>
          import('@pages/main/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'friends',
        loadComponent: () =>
          import('@pages/main/friends-list/friends-list.page').then(
            (m) => m.FriendsListPage
          ),
      },
      // {
      //   path: 'friend-requests',
      //   loadComponent: () =>
      //     import('@pages/main/friends-list/friends-list.page').then(
      //       (m) => m.FriendsListPage
      //     ),
      // },
      {
        path: 'friend-requests',
        loadComponent: () =>
          import('@pages/main/friends-search/friends-search.page').then(
            (m) => m.FriendsSearchPage
          ),
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

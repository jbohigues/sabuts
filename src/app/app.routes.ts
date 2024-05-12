import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./layouts/main-layout/main-layout.routes').then((m) => m.routes),
  },
];

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@pages/login/login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'sign_up',
        loadComponent: () =>
          import('@pages/login/sign-up/sign-up.page').then((m) => m.SignUpPage),
      },
      {
        path: 'forgot_password',
        loadComponent: () =>
          import('@pages/login/forgot-password/forgot-password.page').then(
            (m) => m.ForgotPasswordPage
          ),
      },
    ],
  },
];

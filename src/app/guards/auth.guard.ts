import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { LoginService } from '../services/login.service';
import { UtilsService } from '../services/utils.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const utilsService = inject(UtilsService);

  let user = localStorage.getItem('user');

  return new Promise((resolve) => {
    loginService.getAuth().onAuthStateChanged((auth) => {
      if (auth && user) resolve(true);
      else {
        utilsService.routerLink('/auth');
        resolve(false);
      }
    });
  });
};

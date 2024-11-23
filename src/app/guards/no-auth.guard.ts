import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { LoginService } from '../services/login.service';
import { UtilsService } from '../services/utils.service';

export const NoAuthGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const utilsService = inject(UtilsService);

  return new Promise((resolve) => {
    loginService.getAuth().onAuthStateChanged((auth) => {
      if (!auth) resolve(true);
      else {
        utilsService.routerLink('/home');
        resolve(false);
      }
    });
  });
};

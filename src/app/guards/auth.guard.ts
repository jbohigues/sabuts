import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const AuthGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const auth = inject(Auth);

  return user(auth).pipe(
    take(1),
    map((user) => {
      if (user) return true;

      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: router.url },
      });
    })
  );
};

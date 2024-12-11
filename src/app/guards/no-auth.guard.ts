import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        router.navigate(['/home']);
        return false;
      }
      return true;
    })
  );
};

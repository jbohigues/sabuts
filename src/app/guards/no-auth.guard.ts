import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { map, take } from 'rxjs/operators';

export const NoAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.isLoggedIn().pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        router.navigate(['/home']);
        return false;
      } else {
        return true;
      }
    })
  );
};

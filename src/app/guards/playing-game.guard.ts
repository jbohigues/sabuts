import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { asyncScheduler, Observable, scheduled } from 'rxjs';
import { GameService } from '@services/game.service';

export const PlayingGameGuard: CanActivateFn = (
  activatedRouteSnapshot: ActivatedRouteSnapshot
): Observable<boolean | UrlTree> => {
  const auth = inject(Auth);
  const router = inject(Router);
  const gameService = inject(GameService);

  const gameId = activatedRouteSnapshot.paramMap.get('_idgame');

  if (!gameId) {
    return scheduled([router.parseUrl('/games')], asyncScheduler);
  }

  return user(auth).pipe(
    take(1),
    switchMap((user) => {
      if (!user) {
        return scheduled([router.parseUrl('/login')], asyncScheduler);
      }

      return gameService.getGameById(gameId).pipe(
        map((game) => {
          if (!game) {
            return router.parseUrl('/games');
          }

          const isUsersTurn = game.currentTurn.playerId === user.uid;
          const isUserInGame =
            game.player1.userId === user.uid ||
            game.player2.userId === user.uid;

          return isUserInGame && isUsersTurn ? true : router.parseUrl('/games');
        }),
        catchError(() => {
          location.reload();
          return scheduled([router.parseUrl('/games')], asyncScheduler);
        })
      );
    })
  );
};

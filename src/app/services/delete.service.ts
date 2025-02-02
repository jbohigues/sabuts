import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { catchError, forkJoin, from, of, switchMap, throwError } from 'rxjs';
import { UserService } from './user.service';
import { FriendRequestService } from './friend-request.service';
import { GameService } from './game.service';
import { FriendService } from './friend.service';

@Injectable({
  providedIn: 'root',
})
export class DeleteService {
  private auth = inject(Auth);
  private gameService = inject(GameService);
  private userService = inject(UserService);
  private friendService = inject(FriendService);
  private friendRequestService = inject(FriendRequestService);

  deleteAccount() {
    return of(this.auth.currentUser).pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('No user logged in'));
        }

        return forkJoin([
          this.gameService.deleteUserGames(user.uid),
          this.friendRequestService.deleteSentFriendRequests(user.uid),
          this.friendService.deleteFriendRecords(user.uid),
          this.userService.deleteUser(user.uid),
        ]).pipe(
          switchMap(() => from(user.delete())),
          catchError((error) => {
            console.error('Error deleting account:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }
}

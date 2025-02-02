import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { FriendModel, PartialFriendModel } from '@models/friends.model';
import { UserModel, PartialUserModel } from '@models/users.model';
import {
  Observable,
  catchError,
  forkJoin,
  from,
  map,
  of,
  switchMap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FriendService {
  private firestore = inject(Firestore);

  getFriends(userId: string): Observable<PartialFriendModel[]> {
    const friendsRef = collection(this.firestore, `users/${userId}/friends`);

    return from(getDocs(friendsRef)).pipe(
      switchMap((snapshot) => {
        if (snapshot.empty) {
          // Si no hay documentos, devuelve un array vacío
          return of([]);
        }

        const requests = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as FriendModel)
        );

        // Obtener los datos de los usuarios asociados (sendingUserId)
        const userObservables = requests.map((request) =>
          from(getDoc(doc(this.firestore, `users/${request.friendId}`))).pipe(
            map((userDoc) => {
              if (!userDoc.exists()) {
                throw new Error(
                  `User document not found for ID: ${request.friendId}`
                );
              }

              const userData = userDoc.data() as UserModel;
              // Reducir los datos del usuario al modelo "parcial"
              const friendUser: PartialUserModel = {
                id: userDoc.id,
                name: userData.name,
                userName: userData.userName,
                email: userData.email,
                backgroundColor: userData.backgroundColor,
                avatarid: userData.avatarid,
                totalPoints: userData.totalPoints,
              };
              return { ...request, friendUser };
            }),
            catchError((error) => {
              console.error('Error fetching user data:', error);
              return of(null);
            })
          )
        );

        // Retornar las solicitudes de amistad con los usuarios populados
        return forkJoin(userObservables).pipe(
          map((results) =>
            results.filter(
              (result): result is PartialFriendModel => result !== null
            )
          )
        );
      }),
      catchError((error) => {
        console.error('Error fetching friend requests:', error);
        return of([]);
      })
    );
  }

  createFriend(userId: string, friend: Partial<FriendModel>): Observable<void> {
    const friendsRef = collection(this.firestore, `users/${userId}/friends`);
    return from(addDoc(friendsRef, friend)).pipe(map(() => void 0));
  }

  deleteFriend(userId: string, friendId: string): Observable<void> {
    const friendDoc = doc(
      this.firestore,
      `users/${userId}/friends/${friendId}`
    );
    return from(deleteDoc(friendDoc)).pipe(map(() => void 0));
  }

  deleteFriendRecords(userIdToDelete: string): Observable<void> {
    return from(this.getAllUsers()).pipe(
      switchMap((userIds) => {
        const batch = writeBatch(this.firestore);

        return Promise.all(
          userIds.map((userId) => {
            const friendsRef = collection(
              this.firestore,
              `users/${userId}/friends`
            );
            const friendQuery = query(
              friendsRef,
              where('friendId', '==', userIdToDelete)
            );

            return getDocs(friendQuery).then((snapshot) => {
              snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
              });
            });
          })
        ).then(() => batch.commit());
      })
    );
  }

  private async getAllUsers(): Promise<string[]> {
    const usersRef = collection(this.firestore, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map((doc) => doc.id);
  }
}

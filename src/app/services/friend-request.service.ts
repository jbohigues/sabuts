import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  updateDoc,
} from '@angular/fire/firestore';
import {
  FriendRequestModel,
  PartialFriendRequestModel,
} from '@models/friendRequest.model';
import { PartialUserModel, UserModel } from '@models/users.model';

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
export class FriendRequestService {
  private firestore = inject(Firestore);

  getFriendRequests(userId: string): Observable<PartialFriendRequestModel[]> {
    const requestsRef = collection(
      this.firestore,
      `users/${userId}/friendRequests`
    );

    return from(getDocs(requestsRef)).pipe(
      switchMap((snapshot) => {
        if (snapshot.empty) {
          // Si no hay documentos, devuelve un array vacío
          return of([]);
        }

        const requests = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as FriendRequestModel)
        );

        // Obtener los datos de los usuarios asociados (sendingUserId)
        const userObservables = requests.map((request) =>
          from(
            getDoc(doc(this.firestore, `users/${request.sendingUserId}`))
          ).pipe(
            map((userDoc) => {
              if (!userDoc.exists()) {
                throw new Error(
                  `User document not found for ID: ${request.sendingUserId}`
                );
              }
              const userData = userDoc.data() as UserModel;
              // Reducir los datos del usuario al modelo "parcial"
              const sendingUser: PartialUserModel = {
                id: userDoc.id,
                name: userData.name,
                userName: userData.userName,
                avatarid: userData.avatarid,
                totalPoints: userData.totalPoints,
              };
              return { ...request, sendingUser };
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
              (result): result is PartialFriendRequestModel => result !== null
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

  createFriendRequest(
    userId: string,
    request: FriendRequestModel
  ): Observable<void> {
    const requestsRef = collection(
      this.firestore,
      `users/${userId}/friendRequests`
    );
    return from(addDoc(requestsRef, request)).pipe(map(() => void 0));
  }

  updateFriendRequest(
    userId: string,
    requestId: string,
    request: Partial<FriendRequestModel>
  ): Observable<void> {
    const requestDoc = doc(
      this.firestore,
      `users/${userId}/friendRequests/${requestId}`
    );
    return from(updateDoc(requestDoc, request)).pipe(map(() => void 0));
  }

  deleteFriendRequest(userId: string, requestId: string): Observable<void> {
    const requestDoc = doc(
      this.firestore,
      `users/${userId}/friendRequests/${requestId}`
    );
    return from(deleteDoc(requestDoc)).pipe(map(() => void 0));
  }
}

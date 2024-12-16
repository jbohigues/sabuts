import { inject, Injectable } from '@angular/core';
import { FriendRequestModel } from '@models/friendRequest.model';
import { PartialUserModel, UserModel } from '@models/users.model';
import {
  Firestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { Observable, forkJoin, from, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FriendRequestService {
  private firestore = inject(Firestore);

  getFriendRequests(
    userId: string
  ): Observable<(FriendRequestModel & { sendingUser: PartialUserModel })[]> {
    const requestsRef = collection(
      this.firestore,
      `users/${userId}/friendRequests`
    );
    return from(getDocs(requestsRef)).pipe(
      switchMap((snapshot) => {
        const requests = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as FriendRequestModel)
        );

        // Obtener los datos de los usuarios asociados (sendingUserId)
        const userObservables = requests.map((request) =>
          from(
            getDoc(doc(this.firestore, `users/${request.sendingUserId}`))
          ).pipe(
            map((userDoc) => {
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
            })
          )
        );

        // Retornar las solicitudes de amistad con los usuarios populados
        return forkJoin(userObservables);
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

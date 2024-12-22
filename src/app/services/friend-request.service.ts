import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  Firestore,
  getDoc,
  getDocs,
  Query,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import {
  FriendRequestModel,
  PartialFriendRequestModel,
} from '@models/friendRequest.model';
import { FriendModel } from '@models/friends.model';
import { PartialUserModel, UserModel } from '@models/users.model';
import { ErrorsEnum } from '@sharedEnums/errors';
import { FriendRequestStatusEnum } from '@sharedEnums/states';

import {
  Observable,
  catchError,
  forkJoin,
  from,
  map,
  of,
  switchMap,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FriendRequestService {
  private firestore = inject(Firestore);

  getFriendRequests(
    userId: string,
    status?: number
  ): Observable<PartialFriendRequestModel[]> {
    const requestsRef = collection(
      this.firestore,
      `users/${userId}/friendRequests`
    );
    const requestQuery =
      status != null
        ? query(requestsRef, where('status', '==', status))
        : requestsRef;

    return from(getDocs(requestQuery)).pipe(
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
                backgroundColor: userData.backgroundColor,
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
    receiverId: string,
    request: FriendRequestModel
  ): Observable<string> {
    const friendRef = collection(
      this.firestore,
      `users/${request.sendingUserId}/friends`
    );
    const receiverRequestsRef = collection(
      this.firestore,
      `users/${receiverId}/friendRequests`
    );
    const senderRequestsRef = collection(
      this.firestore,
      `users/${request.sendingUserId}/friendRequests`
    );

    // Comprobamos si ya son amigos
    const checkAlreadyFriends = query(
      friendRef,
      where('friendId', '==', receiverId)
    );

    // Comprobamos si ya existe una solicitud en ambas direcciones
    const checkReceiverRequest = query(
      receiverRequestsRef,
      where('sendingUserId', '==', request.sendingUserId)
    );
    const checkSenderRequest = query(
      senderRequestsRef,
      where('sendingUserId', '==', receiverId)
    );

    return from(
      Promise.all([
        getDocs(checkAlreadyFriends),
        getDocs(checkReceiverRequest),
        getDocs(checkSenderRequest),
      ])
    ).pipe(
      switchMap(([checkAlreadyFriends, receiverSnapshot, senderSnapshot]) => {
        if (!checkAlreadyFriends.empty) {
          // Si ya son amigos
          return throwError(() => new Error(ErrorsEnum.already_friends));
        }
        if (!receiverSnapshot.empty) {
          // Si ya existe una solicitud del emisor al receptor
          return throwError(() => new Error(ErrorsEnum.already_sent_request));
        }
        if (!senderSnapshot.empty) {
          // Si ya existe una solicitud del receptor al emisor
          return throwError(
            () => new Error(ErrorsEnum.already_received_request)
          );
        }

        // Si no existe ninguna solicitud en ninguna dirección, procedemos a crear la nueva solicitud
        const newId = doc(receiverRequestsRef).id;
        const requestWithId = { ...request, id: newId };

        return from(
          setDoc(doc(receiverRequestsRef, newId), requestWithId)
        ).pipe(map(() => newId));
      })
    );
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

  acceptFriendRequest(userId: string, requestId: string): Observable<void> {
    return from(
      runTransaction(this.firestore, async (transaction) => {
        const requestRef = doc(
          this.firestore,
          `users/${userId}/friendRequests/${requestId}`
        );
        const requestDoc = await transaction.get(requestRef);

        if (!requestDoc.exists()) {
          throw new Error("La sol·licitut d'amistat no existeix");
        }

        const request = requestDoc.data() as FriendRequestModel;
        const senderId = request.sendingUserId;

        // Crear entrada de amigo para el usuario actual
        const userFriendRef = doc(
          this.firestore,
          `users/${userId}/friends/${senderId}`
        );
        const userFriend: FriendModel = {
          friendId: senderId, // Guardamos el id del usuario que ha enviado la solitud (es el que se convertirá en amigo)
          addedAt: new Date(),
        };

        // Crear entrada de amigo para el remitente
        const senderFriendRef = doc(
          this.firestore,
          `users/${senderId}/friends/${userId}`
        );
        const senderFriend: FriendModel = {
          friendId: userId,
          addedAt: new Date(),
        };

        // Actualizar el estado de la solicitud
        transaction.update(requestRef, {
          status: FriendRequestStatusEnum.accepted,
        });

        // Añadir entradas de amigos
        transaction.set(userFriendRef, userFriend);
        transaction.set(senderFriendRef, senderFriend);

        // TODO: Opcionalmente, eliminar la solicitud de amistad
        // transaction.delete(requestRef);
      })
    ).pipe(map(() => void 0));
  }

  rejectFriendRequest(userId: string, requestId: string): Observable<void> {
    return from(
      runTransaction(this.firestore, async (transaction) => {
        const requestRef = doc(
          this.firestore,
          `users/${userId}/friendRequests/${requestId}`
        );
        const requestDoc = await transaction.get(requestRef);

        if (!requestDoc.exists()) {
          throw new Error("La sol·licitut d'amistat no existeix");
        }

        // Actualizar el estado de la solicitud a 'rejected'
        transaction.update(requestRef, {
          status: FriendRequestStatusEnum.rejected,
        });

        // TODO: Opcionalmente, eliminar la solicitud de amistad
        // transaction.delete(requestRef);
      })
    ).pipe(map(() => void 0));
  }
}

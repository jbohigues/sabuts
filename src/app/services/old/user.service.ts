// import { inject, Injectable } from '@angular/core';
// import {
//   FriendRequestModel,
//   FriendRequestModelDto,
// } from '@models/friendRequest.model';
// import { UserModel } from '@models/users.model';
// import { StateFriendRequest } from '@sharedEnums/states';
// import {
//   addDoc,
//   arrayUnion,
//   doc,
//   getDocs,
//   updateDoc,
// } from 'firebase/firestore';
// import { FirestoreService } from './firestore.service';
// import { CustomPromiseResponse } from '../shared/interfaces/customPromiseResponse';
// import { combineLatest, Observable } from 'rxjs';
// import {
//   collectionSnapshots,
//   docData,
//   onSnapshot,
// } from '@angular/fire/firestore';
// import { FriendModel } from '@models/friends.model';
// import { map, switchMap } from 'rxjs/operators';
// import { AngularFirestore } from '@angular/fire/compat/firestore';

// @Injectable({
//   providedIn: 'root',
// })
// export class UserService {
//   private firestoreService = inject(FirestoreService);
//   private angularFirestore = inject(AngularFirestore);

//   async getUserByUsername(username: string): Promise<UserModel | undefined> {
//     const q = this.firestoreService.createQuery('users', [
//       'userName',
//       '==',
//       username,
//     ]);

//     const querySnapshot = await getDocs(q);
//     return querySnapshot.docs[0]?.data() as UserModel | undefined;
//   }

//   /**
//    * Genera una solicitud de amistad.
//    * @param request Datos de la solicitud de amistad.
//    */
//   createFriendRequest(request: FriendRequestModelDto): Promise<void> {
//     const id = this.angularFirestore.createId(); // Genera un ID único para la solicitud
//     return this.angularFirestore
//       .collection(`friendRequests/${request.sendingUserId}`)
//       .doc(id)
//       .set(request);
//   }

//   /**
//    * Obtiene las solicitudes de amistad pendientes para un usuario en tiempo real.
//    * @param userId ID del usuario que recibe las solicitudes.
//    * @returns Observable con las solicitudes pendientes incluyendo userName.
//    */
//   getPendingFriendRequests(userId: string): Observable<any[]> {
//     return this.angularFirestore
//       .collection<FriendRequestModel>(`friendRequests/${userId}`, (ref) =>
//         ref.where('status', '==', StateFriendRequest.pendiente)
//       )
//       .valueChanges()
//       .pipe(
//         switchMap((requests) => {
//           const userObservables = requests.map((request) =>
//             this.angularFirestore
//               .doc<UserModel>(`users/${request.sendingUserId}`)
//               .valueChanges()
//               .pipe(
//                 map((user) => ({
//                   ...request,
//                   sendingUserName: user?.userName || '',
//                 }))
//               )
//           );
//           return combineLatest(userObservables);
//         })
//       );
//   }

//   /**
//    * Lista los amigos de un usuario en tiempo real.
//    * @param userId ID del usuario.
//    * @returns Observable con la lista de amigos incluyendo userName.
//    */
//   getFriends(userId: string): Observable<any[]> {
//     return this.angularFirestore
//       .collection<FriendModel>(`users/${userId}/friends`)
//       .valueChanges()
//       .pipe(
//         switchMap((friends) => {
//           const userObservables = friends.map((friend) =>
//             this.angularFirestore
//               .doc<UserModel>(`users/${friend.userid}`)
//               .valueChanges()
//               .pipe(
//                 map((user) => ({
//                   ...friend,
//                   userName: user?.userName || '',
//                 }))
//               )
//           );
//           return combineLatest(userObservables);
//         })
//       );
//   }

//   // async enviarSolicitud(
//   //   sendingUserId: string,
//   //   receivingUserId: string
//   // ): Promise<CustomPromiseResponse> {
//   // const existingFriendship = await this.checkExistingFriendship(
//   //   sendingUserId,
//   //   receivingUserId
//   // );
//   // if (existingFriendship)
//   //   return { success: false, message: 'Ja sou amics/es' };

//   //   const friendRequest: FriendRequestModelDto = {
//   //     sendingUserId,
//   //     receivingUserId,
//   //     createdAt: new Date(),
//   //     updatedAt: new Date(),
//   //     status: StateFriendRequest.pendiente,
//   //   };

//   //   const friendCollectionReference =
//   //     this.firestoreService.getCollectionReference(
//   //       `friends/${receivingUserId}/friendRequests`
//   //     );

//   //   try {
//   //     await addDoc(friendCollectionReference, friendRequest);
//   //     return {
//   //       success: true,
//   //       message: "Sol·licitud d'amistat enviada amb èxit",
//   //     };
//   //   } catch (error) {
//   //     console.error(error);
//   //     return {
//   //       success: false,
//   //       message: "Error al enviar la sol·licitud d'amistat",
//   //     };
//   //   }

//   //   // const sendingUser = await this.getUserByUserId(sendingUserId);
//   //   // const receivingUser = await this.getUserByUserId(receivingUserId);
//   //   // const friendShipCollectionReference =
//   //   //   this.angularFirestoreService.getCollectionReference('friendships');
//   //   // if (sendingUser && receivingUser) {
//   //   //   const friendRequest: FriendRequestModelDto = {
//   //   //     sendingUserId,
//   //   //     sendingUserName: sendingUser.userName,
//   //   //     receivingUserId,
//   //   //     receivingUserName: receivingUser.userName,
//   //   //     createdAt: new Date(),
//   //   //     updatedAt: new Date(),
//   //   //     status: StateFriendRequest.pendiente,
//   //   //   };

//   //   //   try {
//   //   //     await addDoc(friendShipCollectionReference, friendRequest);
//   //   //     return {
//   //   //       success: true,
//   //   //       message: "Sol·licitud d'amistat enviada amb èxit",
//   //   //     };
//   //   //   } catch (error) {
//   //   //     const message = "Error al enviar la sol·licitud d'amistat";
//   //   //     console.error(error);
//   //   //     return { success: false, message };
//   //   //   }
//   //   // } else return { success: false, message: "No s'ha trobat l'usuari" };
//   // }

//   // Función auxiliar para comprobar si ya existe una amistad
//   // private async checkExistingFriendship(
//   //   userId1: string,
//   //   userId2: string
//   // ): Promise<boolean> {
//   //   const q = this.firestoreService.createQuery(
//   //     `friends/${userId1}/friendList`,
//   //     ['userid', '==', userId2]
//   //   );

//   //   const querySnapshot = await getDocs(q);
//   //   return !querySnapshot.empty;
//   // }

//   // async actualizarSolicitud(
//   //   solicitudId: string,
//   //   status: StateFriendRequest.aceptada | StateFriendRequest.rechazada
//   // ): Promise<void> {
//   //   const friendShipReference = this.firestoreService.getDocumentReference(
//   //     'friendships',
//   //     solicitudId
//   //   );
//   //   await updateDoc(friendShipReference, { updatedAt: new Date(), status });
//   // }

//   // async agregarAmigo(
//   //   userId: string,
//   //   friendId: string
//   // ): Promise<CustomPromiseResponse> {
//   //   try {
//   //     const friend: FriendModel = {
//   //       userid: friendId,
//   //       addedAt: new Date(),
//   //     };

//   //     const friendCollectionReference =
//   //       this.firestoreService.getCollectionReference(
//   //         `friends/${userId}/friendList`
//   //       );
//   //     await addDoc(friendCollectionReference, friend);
//   //     return { success: true, message: 'Amic/a afegit/a amb èxit' };
//   //     // const friendsCollectionReference =
//   //     //   this.angularFirestoreService.getCollectionReference(
//   //     //     `friends/${userId}/friendList`
//   //     //   );

//   //     // const userRef = this.angularFirestoreService.getDocumentReference(
//   //     //   'users',
//   //     //   userId
//   //     // );
//   //     // const friendRef = this.angularFirestoreService.getDocumentReference(
//   //     //   'users',
//   //     //   friendId
//   //     // );

//   //     // // Realizar las actualizaciones
//   //     // await updateDoc(userRef, {
//   //     //   friendsList: arrayUnion(friendId),
//   //     // });
//   //     // await updateDoc(friendRef, {
//   //     //   friendsList: arrayUnion(userId),
//   //     // });
//   //   } catch (error) {
//   //     console.error(error);
//   //     return { success: false, message: 'Error al afegir amic/a' };
//   //   }
//   // }
// }

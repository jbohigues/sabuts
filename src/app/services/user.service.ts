import { inject, Injectable } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  updateDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { PartialUserModel, UserModel } from '@models/users.model';
import { query, where } from 'firebase/firestore';

import { Observable, from, map, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);

  getUsers(): Observable<UserModel[]> {
    const usersRef = collection(this.firestore, 'users');
    return from(getDocs(usersRef)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserModel))
      )
    );
  }

  getUserById(id: string): Observable<UserModel> {
    const userDoc = doc(this.firestore, `users/${id}`);
    return from(getDoc(userDoc)).pipe(
      map((snapshot) => ({ id: snapshot.id, ...snapshot.data() } as UserModel))
    );
  }

  findUserByEmail(email: string): Observable<PartialUserModel | null> {
    const usersRef = collection(this.firestore, 'users');
    const emailQuery = query(usersRef, where('email', '==', email));

    return from(getDocs(emailQuery)).pipe(
      map((emailSnapshot) => {
        if (emailSnapshot.empty) return null;

        const userData = emailSnapshot.docs[0].data() as UserModel;

        return {
          id: emailSnapshot.docs[0].id,
          name: userData.name,
          userName: userData.userName,
          email: userData.email,
          backgroundColor: userData.backgroundColor,
          avatarid: userData.avatarid,
          totalPoints: userData.totalPoints,
        };
      })
    );
  }

  // createUser(user: UserModel): Observable<void> {
  //   const userDocRef = doc(this.firestore, `users/${user.id}`);
  //   // Crear el usuario con campos adicionales para las subcolecciones
  //   const userData = {
  //     ...user,
  //     uid: user.id,
  //     friends: {}, // Campo vacío para representar la subcolección
  //     friendRequests: {}, // Campo vacío para representar la subcolección
  //   };
  //   return from(setDoc(userDocRef, userData));
  // }

  // createUsername(username: string, uid: string): Observable<void> {
  //   const usernameDocRef = doc(this.firestore, `usernames/${username}`);
  //   return from(setDoc(usernameDocRef, { uid }));
  // }

  createUserAndUsername(user: UserModel, username: string): Observable<void> {
    const batch = writeBatch(this.firestore);

    const userDocRef = doc(this.firestore, `users/${user.id}`);
    const usernameDocRef = doc(this.firestore, `usernames/${username}`);

    batch.set(userDocRef, {
      ...user,
      uid: user.id,
      friends: {},
      friendRequests: {},
    });
    batch.set(usernameDocRef, { uid: user.id });

    return from(batch.commit());
  }

  updateUser(id: string, user: Partial<UserModel>): Observable<void> {
    const userDoc = doc(this.firestore, `users/${id}`);
    return from(updateDoc(userDoc, user)).pipe(map(() => void 0));
  }

  deleteUser(id: string): Observable<void> {
    const userDoc = doc(this.firestore, `users/${id}`);
    return from(deleteDoc(userDoc)).pipe(map(() => void 0));
  }

  deleteUserName(id: string): Observable<void> {
    const userDoc = doc(this.firestore, `usernames/${id}`);
    return from(deleteDoc(userDoc)).pipe(map(() => void 0));
  }

  deleteUserAccount(id: string): Observable<void> {
    const userDoc = doc(this.firestore, `users/${id}`);
    const friendRequestsRef = collection(
      this.firestore,
      `users/${id}/friendRequests`
    );
    const friendsRef = collection(this.firestore, `users/${id}/friends`);

    return from(getDoc(userDoc)).pipe(
      switchMap((userSnapshot) => {
        if (!userSnapshot.exists()) {
          return throwError(() => new Error('User not found'));
        }
        const userData = userSnapshot.data();
        const username = userData['userName'].toLowerCase().replace(' ', '_');
        console.log(username);

        return from(
          Promise.all([
            getDocs(friendRequestsRef),
            getDocs(friendsRef),
            username
              ? getDoc(doc(this.firestore, `usernames/${username}`))
              : Promise.resolve(null),
          ])
        ).pipe(
          switchMap(
            ([friendRequestsSnapshot, friendsSnapshot, usernameSnapshot]) => {
              const batch = writeBatch(this.firestore);

              // Eliminar todas las solicitudes de amistad del usuario
              friendRequestsSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
              });

              // Eliminar todos los amigos del usuario
              friendsSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
              });

              // Eliminar la entrada en usernames si existe
              if (usernameSnapshot && usernameSnapshot.exists()) {
                batch.delete(usernameSnapshot.ref);
              }

              // Eliminar el documento principal del usuario
              batch.delete(userDoc);

              return from(batch.commit());
            }
          )
        );
      })
    );
  }

  async checkUsernameAvailability(
    username: string,
    currentUserId?: string
  ): Promise<boolean> {
    const usernameDocRef = doc(this.firestore, `usernames/${username}`);
    const docSnapshot = await getDoc(usernameDocRef);

    if (!docSnapshot.exists()) return true; // El nombre de usuario no existe, por lo tanto está disponible

    // Si el documento existe y se proporcionó un currentUserId, verifica si pertenece al usuario actual
    if (currentUserId) {
      const data = docSnapshot.data();
      return data && data['uid'] === currentUserId;
    }

    // El nombre de usuario existe y no pertenece al usuario actual
    return false;
  }

  // async migrateUsernamesCollection() {
  //   const usersRef = collection(this.firestore, 'users');
  //   const usernamesRef = collection(this.firestore, 'usernames');

  //   let batch = writeBatch(this.firestore);
  //   let count = 0;
  //   let batchCount = 0;

  //   try {
  //     const querySnapshot = await getDocs(usersRef);

  //     for (const userDoc of querySnapshot.docs) {
  //       const userData = userDoc.data();
  //       const username = userData['userName'];
  //       const uid = userDoc.id;

  //       if (username) {
  //         const usernameDocRef = doc(
  //           usernamesRef,
  //           username.toLowerCase().replace(' ', '_')
  //         );
  //         batch.set(usernameDocRef, { uid });

  //         count++;

  //         // Firestore permite un máximo de 500 operaciones por lote
  //         if (count % 499 === 0) {
  //           await batch.commit();
  //           batch = writeBatch(this.firestore);
  //           batchCount++;
  //           console.log(
  //             `Committed batch ${batchCount}. Total usernames processed: ${count}`
  //           );
  //         }
  //       }
  //     }

  //     // Commit any remaining operations
  //     if (count % 499 !== 0) {
  //       await batch.commit();
  //       batchCount++;
  //       console.log(
  //         `Final batch committed. Total usernames processed: ${count}`
  //       );
  //     }

  //     console.log(`Migration complete. Total usernames migrated: ${count}`);
  //   } catch (error) {
  //     console.error('Error during migration:', error);
  //   }
  // }
}

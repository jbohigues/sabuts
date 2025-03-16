import { inject, Injectable } from '@angular/core';
import { Auth, AuthErrorCodes, deleteUser } from '@angular/fire/auth';
import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class DeleteService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  async deleteUserAccount(userId: string, username: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      const batch = writeBatch(this.firestore);
      const userDocRef = doc(this.firestore, `users/${userId}`);

      // Obtener los datos del usuario
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error('Usuari no trobat');
      }

      // Extraer los IDs de los amigos
      const friendsCollectionRef = collection(userDocRef, 'friends');
      const friendsSnapshot = await getDocs(friendsCollectionRef);
      const friendIds = friendsSnapshot.docs.map((doc) => doc.id);

      // Eliminar las partidas en las que participa el usuario
      await this.deleteUserGames(userId, batch);

      // Eliminar las solicitudes de amistad enviadas por el usuario
      await this.deleteSentFriendRequests(userId, batch);

      // Eliminar al usuario de las listas de amigos
      await this.removeFromFriendLists(userId, friendIds, batch);

      // Eliminar el documento del usuario y su username
      await this.deleteUserDocument(userId, username, batch);

      // Confirmar todas las operaciones en Firestore
      await batch.commit();

      // // Intentar eliminar la cuenta de autenticación
      // const authResult = await this.deleteAuthAccount();
      // return authResult;
    } catch (error) {
      throw error;
    }
  }

  private async deleteUserGames(userId: string, batch: any): Promise<void> {
    const gamesQuery = query(
      collection(this.firestore, 'games'),
      where('player1.userId', '==', userId)
    );
    const games2Query = query(
      collection(this.firestore, 'games'),
      where('player2.userId', '==', userId)
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(gamesQuery),
      getDocs(games2Query),
    ]);

    snapshot1.docs
      .concat(snapshot2.docs)
      .forEach((doc) => batch.delete(doc.ref));
  }

  private async deleteSentFriendRequests(
    userId: string,
    batch: any
  ): Promise<void> {
    // Obtener todos los usuarios
    const usersSnapshot = await getDocs(collection(this.firestore, 'users'));

    // Iterar sobre cada usuario y buscar solicitudes enviadas por el usuario actual
    for (const userDoc of usersSnapshot.docs) {
      const friendRequestsRef = collection(
        this.firestore,
        `users/${userDoc.id}/friendRequests`
      );
      const friendRequestsQuery = query(
        friendRequestsRef,
        where('sendingUserId', '==', userId)
      );

      const friendRequestsSnapshot = await getDocs(friendRequestsQuery);

      // Eliminar todas las solicitudes encontradas
      friendRequestsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
    }
  }

  private async removeFromFriendLists(
    userId: string,
    friendIds: string[],
    batch: any
  ): Promise<void> {
    // Iterar sobre cada amigo y eliminar el documento correspondiente en la subcolección "friends"
    friendIds.forEach((friendId) => {
      const friendDocRef = doc(
        this.firestore,
        `users/${friendId}/friends/${userId}`
      );
      batch.delete(friendDocRef);
    });
  }

  private async deleteUserDocument(
    userId: string,
    username: string,
    batch: any
  ): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const usernameDocRef = doc(this.firestore, `usernames/${username}`);

    // Eliminar los documentos de la subcolección "friendRequests"
    const friendRequestsCollectionRef = collection(
      this.firestore,
      `users/${userId}/friendRequests`
    );
    const friendRequestsSnapshot = await getDocs(friendRequestsCollectionRef);
    friendRequestsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

    // Eliminar los documentos de la subcolección "friends"
    const friendsCollectionRef = collection(
      this.firestore,
      `users/${userId}/friends`
    );
    const friendsSnapshot = await getDocs(friendsCollectionRef);
    friendsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

    // Eliminar el documento principal del usuario y su username
    batch.delete(userDocRef);
    batch.delete(usernameDocRef);
  }

  async deleteAuthAccount(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      await deleteUser(user);
    } catch (error: any) {
      throw new Error(error);
    }
  }

  // async deleteAuthAccount(): Promise<{
  //   success: boolean;
  //   requiresReauth: boolean;
  // }> {
  //   const user = this.auth.currentUser;
  //   if (!user) throw new Error('No hay usuario autenticado');

  //   try {
  //     await deleteUser(user);
  //     return { success: true, requiresReauth: false };
  //   } catch (error: any) {
  //     if (error.code === AuthErrorCodes.CREDENTIAL_TOO_OLD_LOGIN_AGAIN) {
  //       return { success: false, requiresReauth: true };
  //     }
  //     throw new Error(
  //       error.message || 'Error al eliminar la cuenta de autenticación'
  //     );
  //   }
  // }
}
